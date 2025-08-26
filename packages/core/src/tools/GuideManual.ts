import { tool } from "@langchain/core/tools";
import { z } from "zod";

const changeGuideSchema = z.object({
	requestType: z.enum([
		"authority change",
		"payment account change",
		"seal sign change",
	]),
});

type ChangeGuideRequest = z.infer<typeof changeGuideSchema>;

/**
 * 통합 변경 가이드를 제공하는 툴
 */
export const changeGuideTool = tool(
	(input) => {
		const { requestType } = input as ChangeGuideRequest;
		switch (requestType) {
			case "authority change": {
				const authorityFiles = ["authority_change.docx"];
				return `첨부된 파일 양식을 채우고 서명을 하면 됩니다.
attachments: [${authorityFiles.join(", ")}]`;
			}

			case "payment account change": {
				const paymentFiles = ["payment_account_change.docx"];
				return `결제계좌 변경 안내:

안녕하세요. 고객님. 요청하신 결제계좌 변경에 대한 가이드를 드립니다.

첨부해드린 양식을 다음과 같이 작성해 주시기 바랍니다:

1. 결제계좌 변경 신청서 작성
   - 기존 결제계좌 정보
   - 신규 결제계좌 정보 (은행명, 계좌번호, 예금주명)
   - 변경 사유 기재

2. 함께 제출해야 할 서류
   - 신규 통장 사본 또는 잔액증명서
   - 수권자 신분증 사본
   - 법인 인감증명서 (법인 고객의 경우)
   - 계좌 개설 확인서 (필요시)

작성하신 서류에 서명을 하신 후, 필요 서류와 함께 다시 첨부하여 회신해 주시기 바랍니다.

처리 방법에 따른 소요 시간:
- 온라인 제출: 당일 처리
- 영업점 방문: 당일 처리
- 이메일/팩스: 1-2 영업일

변경 적용은 신청일 익일부터 적용되며, 월 결제일 전 3일까지 신청하시길 권장드립니다.

추가 문의사항이 있으시면 언제든 연락해 주세요.
attachments: [${paymentFiles.join(", ")}]`;
			}

			case "seal sign change": {
				const sealFiles = ["seal_sign_change.docx"];
				return `인감/사인 변경 안내:

안녕하세요. 고객님. 요청하신 인감(또는 사인) 변경에 대한 가이드를 드립니다.

첨부해드린 양식을 다음과 같이 작성해 주시기 바랍니다:

1. 인감/사인 변경 신청서 작성
   - 계좌번호 및 기본 정보 기재
   - 변경 사유 명시
   - 기존 인감/사인으로 서명 날인

2. 함께 준비해야 할 서류 (인감 변경의 경우)
   - 신규 인감증명서 (최근 3개월 이내)
   - 구 인감증명서 (폐기 확인용)
   - 법인 등기부 등본
   - 수권자 신분증

3. 사인 변경의 경우
   - 기존 사인으로 신청서 서명
   - 신규 사인 샘플 5회 서명 (첨부 양식에 포함)

작성하신 서류를 준비하신 후, 반드시 영업점에 직접 방문하여 제출해 주시기 바랍니다.
(인감/사인 변경은 본인 확인이 필수로 우편이나 이메일 제출이 불가합니다)

처리 시간: 당일 완료
주의사항: 변경 즉시 기존 인감/사인은 무효 처리되며, 이후 모든 거래에 신규 인감/사인을 사용하셔야 합니다.

추가 문의사항이 있으시면 언제든 연락해 주세요.
attachments: [${sealFiles.join(", ")}]`;
			}

			default:
				return "지원하지 않는 요청 유형입니다.";
		}
	},
	{
		name: "change_guide",
		description:
			"수권자 변경, 결제계좌 변경, 인감/사인 변경에 대한 통합 가이드를 제공합니다. 사내 인사이동, 담당자 변경, 수권자 변경, 계좌변경, 출금계좌 변경, 자동이체 계좌 변경, 인감변경, 사인변경, 서명변경, 도장변경 등의 요청에 사용됩니다.",
		schema: changeGuideSchema,
	},
);
