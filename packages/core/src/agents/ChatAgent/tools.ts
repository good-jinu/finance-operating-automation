import { DynamicTool } from "@langchain/core/tools";
import {
	findAuthorizedPersonByName,
	findAuthorizedPersonsByCompanyId,
	updateAuthorizedPerson,
} from "../../models/AuthorizedPerson";
import {
	findAllCustomerCompanies,
	findCustomerCompanyByName,
} from "../../models/CustomerCompany";
import {
	findLatestOfficialSealByCompanyId,
	updateOfficialSeal,
} from "../../models/OfficialSeal";
import {
	findPaymentAccountByAccountHolder,
	findPaymentAccountByAccountNumber,
	findPaymentAccountsByCompanyId,
	updatePaymentAccount,
} from "../../models/PaymentAccount";
import {
	findAllReplyMails,
	findReplyMailsByStatus,
	type ReplyMailWithOriginal,
} from "../../models/ReplyMail";
import { createGmailClient } from "../../services/gmailClient";

/**
 * Gmail 메일 목록 조회 도구
 */
export const gmailListTool = new DynamicTool({
	name: "gmail_list",
	description:
		"Gmail에서 메일 목록을 조회합니다. 읽지 않은 메일만 조회하거나 전체 메일을 조회할 수 있습니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				unread_only?: boolean;
				limit?: number;
			};

			const gmailClient = await createGmailClient();
			const mails = await gmailClient.getMailsFromDatabase(
				params.limit || 50,
				0,
				params.unread_only || false,
			);

			return JSON.stringify({
				success: true,
				count: mails.length,
				mails: mails.map((mail) => ({
					id: mail.id,
					message_id: mail.message_id,
					subject: mail.subject,
					sender: mail.sender,
					recipient: mail.recipient,
					snippet: mail.snippet,
					is_unread: mail.is_unread,
					has_attachments: mail.has_attachments,
					created_at: mail.created_at,
				})),
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `Gmail 메일 목록 조회 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 답장 메일 목록 조회 도구
 */
export const replyMailListTool = new DynamicTool({
	name: "reply_mail_list",
	description:
		"생성된 답장 메일 목록을 조회합니다. 발송된/미발송 답장 메일을 필터링할 수 있습니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				sent_only?: boolean;
				unsent_only?: boolean;
				limit?: number;
			};

			let replyMails: ReplyMailWithOriginal[] = [];
			if (params.sent_only) {
				replyMails = findReplyMailsByStatus(true, params.limit || 50);
			} else if (params.unsent_only) {
				replyMails = findReplyMailsByStatus(false, params.limit || 50);
			} else {
				replyMails = findAllReplyMails(params.limit || 50);
			}

			return JSON.stringify({
				success: true,
				count: replyMails.length,
				reply_mails: replyMails,
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `답장 메일 목록 조회 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 회사 정보 조회 도구
 */
export const companySearchTool = new DynamicTool({
	name: "company_search",
	description:
		"회사명으로 회사 정보를 검색합니다. 정확한 회사명이나 부분 검색을 지원합니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				company_name?: string;
				list_all?: boolean;
			};

			if (params.list_all) {
				const companies = findAllCustomerCompanies();
				return JSON.stringify({
					success: true,
					count: companies.length,
					companies,
				});
			}

			if (!params.company_name) {
				return JSON.stringify({
					success: false,
					error: "회사명이 필요합니다.",
				});
			}

			const company = findCustomerCompanyByName(params.company_name);
			if (!company) {
				return JSON.stringify({
					success: false,
					error: `'${params.company_name}' 회사를 찾을 수 없습니다.`,
				});
			}

			return JSON.stringify({
				success: true,
				company,
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `회사 검색 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 수권자 정보 조회 및 변경 도구
 */
export const authorizedPersonTool = new DynamicTool({
	name: "authorized_person",
	description:
		"수권자 정보를 조회하거나 변경합니다. 회사명과 수권자명으로 검색하고 업데이트할 수 있습니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				action: "search" | "update" | "list_by_company";
				company_name?: string;
				person_name?: string;
				update_data?: {
					name?: string;
					email?: string;
					phone_number?: string;
				};
			};

			// 회사 정보 조회
			if (params.company_name) {
				const company = findCustomerCompanyByName(params.company_name);
				if (!company) {
					return JSON.stringify({
						success: false,
						error: `'${params.company_name}' 회사를 찾을 수 없습니다.`,
					});
				}

				if (params.action === "list_by_company") {
					const persons = findAuthorizedPersonsByCompanyId(company.id!);
					return JSON.stringify({
						success: true,
						count: persons.length,
						authorized_persons: persons,
					});
				}

				if (params.person_name) {
					const person = findAuthorizedPersonByName(
						params.person_name,
						company.id,
					);

					if (params.action === "search") {
						if (!person) {
							return JSON.stringify({
								success: false,
								error: `회사 '${params.company_name}'에서 수권자 '${params.person_name}'을 찾을 수 없습니다.`,
							});
						}
						return JSON.stringify({
							success: true,
							authorized_person: person,
						});
					}

					if (params.action === "update") {
						if (!person) {
							return JSON.stringify({
								success: false,
								error: `회사 '${params.company_name}'에서 수권자 '${params.person_name}'을 찾을 수 없습니다.`,
							});
						}

						if (!params.update_data) {
							return JSON.stringify({
								success: false,
								error: "업데이트할 데이터가 필요합니다.",
							});
						}

						const success = updateAuthorizedPerson(
							person.id!,
							params.update_data,
						);
						return JSON.stringify({
							success,
							message: success
								? `수권자 '${params.person_name}'의 정보가 성공적으로 업데이트되었습니다.`
								: `수권자 '${params.person_name}'의 정보 업데이트에 실패했습니다.`,
						});
					}
				}
			}

			return JSON.stringify({
				success: false,
				error:
					"필수 파라미터가 누락되었습니다. (company_name, person_name, action)",
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `수권자 작업 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 결제계좌 정보 조회 및 변경 도구
 */
export const paymentAccountTool = new DynamicTool({
	name: "payment_account",
	description:
		"결제계좌 정보를 조회하거나 변경합니다. 계좌번호, 예금주명으로 검색하고 업데이트할 수 있습니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				action:
					| "search_by_account"
					| "search_by_holder"
					| "update"
					| "list_by_company";
				company_name?: string;
				account_number?: string;
				account_holder?: string;
				update_data?: {
					bank_name?: string;
					account_number?: string;
					account_holder?: string;
				};
			};

			// 회사 정보 조회
			if (params.company_name) {
				const company = findCustomerCompanyByName(params.company_name);
				if (!company) {
					return JSON.stringify({
						success: false,
						error: `'${params.company_name}' 회사를 찾을 수 없습니다.`,
					});
				}

				if (params.action === "list_by_company") {
					const accounts = findPaymentAccountsByCompanyId(company.id!);
					return JSON.stringify({
						success: true,
						count: accounts.length,
						payment_accounts: accounts,
					});
				}

				let account = null;
				if (params.action === "search_by_account" && params.account_number) {
					account = findPaymentAccountByAccountNumber(
						params.account_number,
						company.id,
					);
				} else if (
					params.action === "search_by_holder" &&
					params.account_holder
				) {
					account = findPaymentAccountByAccountHolder(
						params.account_holder,
						company.id,
					);
				} else if (params.action === "update") {
					// 업데이트의 경우 계좌번호나 예금주명으로 찾기
					if (params.account_number) {
						account = findPaymentAccountByAccountNumber(
							params.account_number,
							company.id,
						);
					} else if (params.account_holder) {
						account = findPaymentAccountByAccountHolder(
							params.account_holder,
							company.id,
						);
					}
				}

				if (params.action.startsWith("search")) {
					if (!account) {
						const searchInfo = params.account_number
							? `계좌번호 '${params.account_number}'`
							: `예금주 '${params.account_holder}'`;
						return JSON.stringify({
							success: false,
							error: `회사 '${params.company_name}'에서 ${searchInfo}에 해당하는 결제계좌를 찾을 수 없습니다.`,
						});
					}
					return JSON.stringify({
						success: true,
						payment_account: account,
					});
				}

				if (params.action === "update") {
					if (!account) {
						const searchInfo = params.account_number
							? `계좌번호 '${params.account_number}'`
							: params.account_holder
								? `예금주 '${params.account_holder}'`
								: "지정된 조건";
						return JSON.stringify({
							success: false,
							error: `회사 '${params.company_name}'에서 ${searchInfo}에 해당하는 결제계좌를 찾을 수 없습니다.`,
						});
					}

					if (!params.update_data) {
						return JSON.stringify({
							success: false,
							error: "업데이트할 데이터가 필요합니다.",
						});
					}

					const success = updatePaymentAccount(account.id!, params.update_data);
					const accountInfo = params.account_number
						? `계좌번호 '${params.account_number}'`
						: `예금주 '${params.account_holder}'`;
					return JSON.stringify({
						success,
						message: success
							? `결제계좌 (${accountInfo})의 정보가 성공적으로 업데이트되었습니다.`
							: `결제계좌 (${accountInfo})의 정보 업데이트에 실패했습니다.`,
					});
				}
			}

			return JSON.stringify({
				success: false,
				error: "필수 파라미터가 누락되었습니다. (company_name, action)",
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `결제계좌 작업 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 인감/서명 정보 조회 및 변경 도구
 */
export const officialSealTool = new DynamicTool({
	name: "official_seal",
	description:
		"회사의 인감/서명 정보를 조회하거나 변경합니다. 회사명으로 검색하고 파일 경로를 업데이트할 수 있습니다.",
	func: async (input: string) => {
		try {
			const params = JSON.parse(input) as {
				action: "search" | "update";
				company_name: string;
				update_data?: {
					file_path: string;
				};
			};

			if (!params.company_name) {
				return JSON.stringify({
					success: false,
					error: "회사명이 필요합니다.",
				});
			}

			// 회사 정보 조회
			const company = findCustomerCompanyByName(params.company_name);
			if (!company) {
				return JSON.stringify({
					success: false,
					error: `'${params.company_name}' 회사를 찾을 수 없습니다.`,
				});
			}

			const seal = findLatestOfficialSealByCompanyId(company.id!);

			if (params.action === "search") {
				if (!seal) {
					return JSON.stringify({
						success: false,
						error: `회사 '${params.company_name}'에 등록된 인감을 찾을 수 없습니다.`,
					});
				}
				return JSON.stringify({
					success: true,
					official_seal: seal,
				});
			}

			if (params.action === "update") {
				if (!seal) {
					return JSON.stringify({
						success: false,
						error: `회사 '${params.company_name}'에 등록된 인감을 찾을 수 없습니다.`,
					});
				}

				if (!params.update_data || !params.update_data.file_path) {
					return JSON.stringify({
						success: false,
						error: "업데이트할 파일 경로가 필요합니다.",
					});
				}

				const success = updateOfficialSeal(seal.id!, params.update_data);
				return JSON.stringify({
					success,
					message: success
						? `회사 '${params.company_name}'의 인감/서명 정보가 성공적으로 업데이트되었습니다.`
						: `회사 '${params.company_name}'의 인감/서명 정보 업데이트에 실패했습니다.`,
				});
			}

			return JSON.stringify({
				success: false,
				error: "지원하지 않는 액션입니다.",
			});
		} catch (error) {
			return JSON.stringify({
				success: false,
				error: `인감/서명 작업 중 오류 발생: ${error}`,
			});
		}
	},
});

/**
 * 모든 도구들을 배열로 내보내기
 */
export const chatAgentTools = [
	gmailListTool,
	replyMailListTool,
	companySearchTool,
	authorizedPersonTool,
	paymentAccountTool,
	officialSealTool,
];
