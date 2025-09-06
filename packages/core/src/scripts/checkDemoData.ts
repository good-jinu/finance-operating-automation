#!/usr/bin/env node

/**
 * 생성된 데모 데이터 확인 스크립트
 */

import { findAllCustomerCompanies } from "../models/CustomerCompany";
import { findAllAuthorizedPersons } from "../models/AuthorizedPerson";
import { findAllPaymentAccounts } from "../models/PaymentAccount";
import { findAllOfficialSeals } from "../models/OfficialSeal";
import { findRecentGmailMessages } from "../models/GmailMessage";

async function checkDemoData() {
  console.log("=== 데모 데이터 확인 ===\n");

  try {
    // 1. 고객사 확인
    const companies = findAllCustomerCompanies();
    console.log(`📊 고객사 (${companies.length}개):`);
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (ID: ${company.id})`);
    });
    console.log("");

    // 2. 수권자 확인
    const authorizedPersons = findAllAuthorizedPersons();
    console.log(`👥 수권자 (${authorizedPersons.length}명):`);
    const personsByCompany = authorizedPersons.reduce((acc, person) => {
      const companyName = companies.find(c => c.id === person.company_id)?.name || "알 수 없음";
      if (!acc[companyName]) acc[companyName] = [];
      acc[companyName].push(person);
      return acc;
    }, {} as Record<string, typeof authorizedPersons>);

    Object.entries(personsByCompany).forEach(([companyName, persons]) => {
      console.log(`  ${companyName}:`);
      persons.forEach(person => {
        console.log(`    - ${person.name} (${person.email}, ${person.phone_number})`);
      });
    });
    console.log("");

    // 3. 결제계좌 확인
    const paymentAccounts = findAllPaymentAccounts();
    console.log(`🏦 결제계좌 (${paymentAccounts.length}개):`);
    const accountsByCompany = paymentAccounts.reduce((acc, account) => {
      const companyName = companies.find(c => c.id === account.company_id)?.name || "알 수 없음";
      if (!acc[companyName]) acc[companyName] = [];
      acc[companyName].push(account);
      return acc;
    }, {} as Record<string, typeof paymentAccounts>);

    Object.entries(accountsByCompany).forEach(([companyName, accounts]) => {
      console.log(`  ${companyName}:`);
      accounts.forEach(account => {
        console.log(`    - ${account.bank_name} ${account.account_number} (${account.account_holder})`);
      });
    });
    console.log("");

    // 4. 인감 데이터 확인
    const officialSeals = findAllOfficialSeals();
    console.log(`🖊️  인감 파일 (${officialSeals.length}개):`);
    const sealsByCompany = officialSeals.reduce((acc, seal) => {
      const companyName = companies.find(c => c.id === seal.company_id)?.name || "알 수 없음";
      if (!acc[companyName]) acc[companyName] = [];
      acc[companyName].push(seal);
      return acc;
    }, {} as Record<string, typeof officialSeals>);

    Object.entries(sealsByCompany).forEach(([companyName, seals]) => {
      console.log(`  ${companyName}:`);
      seals.forEach(seal => {
        console.log(`    - ${seal.file_path}`);
      });
    });
    console.log("");

    // 5. Gmail 메시지 확인
    const gmailMessages = findRecentGmailMessages(50);
    console.log(`📧 Gmail 메시지 (${gmailMessages.length}개):`);
    const messagesByCompany = gmailMessages.reduce((acc, message) => {
      // 회사명을 제목에서 추출
      const match = message.subject?.match(/^\[([^\]]+)\]/);
      const companyName = match ? match[1] : "알 수 없음";
      if (!acc[companyName]) acc[companyName] = [];
      acc[companyName].push(message);
      return acc;
    }, {} as Record<string, typeof gmailMessages>);

    Object.entries(messagesByCompany).forEach(([companyName, messages]) => {
      console.log(`  ${companyName}:`);
      messages.forEach(message => {
        const status = message.is_unread ? "🔴 미읽음" : "✅ 읽음";
        const attachments = message.has_attachments ? "📎" : "";
        console.log(`    - ${status} ${message.subject} ${attachments}`);
        console.log(`      발신: ${message.sender} → 수신: ${message.recipient}`);
      });
    });
    console.log("");

    console.log("=== 요약 ===");
    console.log(`총 ${companies.length}개 회사`);
    console.log(`총 ${authorizedPersons.length}명 수권자`);
    console.log(`총 ${paymentAccounts.length}개 계좌`);
    console.log(`총 ${officialSeals.length}개 인감`);
    console.log(`총 ${gmailMessages.length}개 메시지`);
    
    const unreadCount = gmailMessages.filter(m => m.is_unread).length;
    const attachmentCount = gmailMessages.filter(m => m.has_attachments).length;
    console.log(`- 미읽음 메시지: ${unreadCount}개`);
    console.log(`- 첨부파일 있는 메시지: ${attachmentCount}개`);

  } catch (error) {
    console.error("데모 데이터 확인 중 오류:", error);
  }
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  checkDemoData()
    .then(() => {
      console.log("\n데모 데이터 확인이 완료되었습니다.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("데모 데이터 확인 실패:", error);
      process.exit(1);
    });
}

export { checkDemoData };
