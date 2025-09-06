#!/usr/bin/env node

/**
 * 데모 데이터 생성 스크립트
 * DB 초기화 시 사용할 샘플 데이터들을 생성합니다.
 */

import { createCustomerCompany } from "../models/CustomerCompany";
import { createAuthorizedPerson } from "../models/AuthorizedPerson";
import { createPaymentAccount } from "../models/PaymentAccount";
import { createOfficialSeal } from "../models/OfficialSeal";
import { createGmailMessage } from "../models/GmailMessage";

// 데모용 고객사 데이터
const DEMO_COMPANIES = [
  "한국증권",
  "서울전자",
  "부산물산",
  "대구금융",
  "제주테크",
  "광주산업",
] as const;

// 데모용 수권자 데이터
const DEMO_AUTHORIZED_PERSONS = [
  { name: "김대표", email: "ceo@company.co.kr", phone_number: "02-1234-5678", position: "대표이사" },
  { name: "이재무", email: "finance@company.co.kr", phone_number: "02-1234-5679", position: "재무담당" },
  { name: "박총무", email: "admin@company.co.kr", phone_number: "02-1234-5680", position: "총무부장" },
  { name: "최법무", email: "legal@company.co.kr", phone_number: "02-1234-5681", position: "법무담당" },
] as const;

// 데모용 은행 데이터
const DEMO_BANKS = [
  "국민은행",
  "신한은행", 
  "하나은행",
  "우리은행",
  "기업은행",
  "농협은행",
] as const;

/**
 * 랜덤 계좌번호 생성
 */
function generateAccountNumber(): string {
  const randomNum = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `123-${randomNum.slice(0, 6)}-${randomNum.slice(6)}`;
}

/**
 * 랜덤 Gmail 메시지 ID 생성
 */
function generateGmailMessageId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 랜덤 Thread ID 생성
 */
function generateThreadId(): string {
  return generateGmailMessageId();
}

/**
 * 현재 시간을 기준으로 최근 며칠 내의 랜덤한 시간 생성
 */
function getRandomRecentDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 최근 7일 내
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const randomDate = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000 - minutesAgo * 60 * 1000);
  return randomDate.getTime().toString();
}

/**
 * 고객사 데모 데이터 생성
 */
export async function seedCompanies() {
  console.log("고객사 데모 데이터 생성 중...");
  
  const companies = [];
  
  for (const companyName of DEMO_COMPANIES) {
    try {
      const company = createCustomerCompany({ name: companyName });
      companies.push(company);
      console.log(`✓ 고객사 생성: ${companyName}`);
    } catch (error) {
      console.error(`✗ 고객사 생성 실패: ${companyName}`, error);
    }
  }
  
  return companies;
}

/**
 * 수권자 데모 데이터 생성
 */
export async function seedAuthorizedPersons(companies: Array<{ id?: number; name: string }>) {
  console.log("수권자 데모 데이터 생성 중...");
  
  const authorizedPersons = [];
  
  for (const company of companies) {
    if (!company.id) continue;
    
    // 각 회사마다 2-3명의 수권자 생성
    const personCount = Math.floor(Math.random() * 2) + 2; // 2-3명
    
    for (let i = 0; i < personCount; i++) {
      const personTemplate = DEMO_AUTHORIZED_PERSONS[i % DEMO_AUTHORIZED_PERSONS.length];
      
      // 회사명에 따라 이메일 도메인 조정
      const emailDomain = company.name.includes("증권") ? "securities.co.kr" :
                         company.name.includes("전자") ? "electronics.co.kr" :
                         company.name.includes("물산") ? "trading.co.kr" :
                         company.name.includes("금융") ? "finance.co.kr" :
                         company.name.includes("테크") ? "tech.co.kr" :
                         "company.co.kr";
      
      const email = personTemplate.email.replace("company.co.kr", emailDomain);
      
      try {
        const person = createAuthorizedPerson({
          company_id: company.id,
          name: personTemplate.name,
          email: email,
          phone_number: personTemplate.phone_number,
        });
        authorizedPersons.push(person);
        console.log(`✓ 수권자 생성: ${company.name} - ${personTemplate.name}`);
      } catch (error) {
        console.error(`✗ 수권자 생성 실패: ${company.name} - ${personTemplate.name}`, error);
      }
    }
  }
  
  return authorizedPersons;
}

/**
 * 결제계좌 데모 데이터 생성
 */
export async function seedPaymentAccounts(companies: Array<{ id?: number; name: string }>) {
  console.log("결제계좌 데모 데이터 생성 중...");
  
  const accounts = [];
  
  for (const company of companies) {
    if (!company.id) continue;
    
    // 각 회사마다 1-2개의 계좌 생성
    const accountCount = Math.floor(Math.random() * 2) + 1; // 1-2개
    
    for (let i = 0; i < accountCount; i++) {
      const bankName = DEMO_BANKS[Math.floor(Math.random() * DEMO_BANKS.length)];
      const accountNumber = generateAccountNumber();
      const accountHolder = `(주)${company.name}`;
      
      try {
        const account = createPaymentAccount({
          company_id: company.id,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        });
        accounts.push(account);
        console.log(`✓ 결제계좌 생성: ${company.name} - ${bankName} ${accountNumber}`);
      } catch (error) {
        console.error(`✗ 결제계좌 생성 실패: ${company.name} - ${bankName}`, error);
      }
    }
  }
  
  return accounts;
}

/**
 * 인감/서명 데모 데이터 생성
 */
export async function seedOfficialSeals(companies: Array<{ id?: number; name: string }>) {
  console.log("인감/서명 데모 데이터 생성 중...");
  
  const seals = [];
  
  for (const company of companies) {
    if (!company.id) continue;
    
    // 각 회사마다 1개의 인감 파일 경로 생성
    const filePath = `/seals/${company.name}_official_seal.png`;
    
    try {
      const seal = createOfficialSeal({
        company_id: company.id,
        file_path: filePath,
      });
      seals.push(seal);
      console.log(`✓ 인감 데이터 생성: ${company.name} - ${filePath}`);
    } catch (error) {
      console.error(`✗ 인감 데이터 생성 실패: ${company.name}`, error);
    }
  }
  
  return seals;
}

/**
 * 데모 Gmail 메시지 데이터 생성
 */
export async function seedGmailMessages(companies: Array<{ id?: number; name: string }>) {
  console.log("Gmail 메시지 데모 데이터 생성 중...");
  
  const messages = [];
  
  // 샘플 이메일 템플릿들
  const emailTemplates = [
    {
      subject: "수권자 변경 신청 관련 문의",
      body: "안녕하세요. 저희 회사 수권자 변경 신청을 진행하려고 합니다. 필요한 서류와 절차에 대해 안내 부탁드립니다.",
      snippet: "수권자 변경 신청을 진행하려고 합니다. 필요한 서류와 절차에 대해 안내..."
    },
    {
      subject: "결제계좌 변경 요청",
      body: "안녕하세요. 저희 회사의 자동이체 계좌를 변경하고자 합니다. 새로운 계좌 정보로 변경 절차를 진행해주시기 바랍니다.",
      snippet: "자동이체 계좌를 변경하고자 합니다. 새로운 계좌 정보로 변경 절차를..."
    },
    {
      subject: "법인인감 재등록 신청",
      body: "안녕하세요. 법인인감을 새로 제작하여 재등록을 진행하려고 합니다. 인감 등록 절차와 필요 서류에 대해 문의드립니다.",
      snippet: "법인인감을 새로 제작하여 재등록을 진행하려고 합니다. 인감 등록 절차와..."
    },
    {
      subject: "대표이사 변경에 따른 수권자 업데이트",
      body: "안녕하세요. 저희 회사 대표이사가 변경되어 수권자 정보를 업데이트해야 합니다. 관련 절차를 안내해 주시기 바랍니다.",
      snippet: "대표이사가 변경되어 수권자 정보를 업데이트해야 합니다. 관련 절차를..."
    },
    {
      subject: "재무담당자 연락처 변경 요청",
      body: "안녕하세요. 저희 회사 재무담당자의 연락처가 변경되었습니다. 등록된 정보를 업데이트해 주시기 바랍니다.",
      snippet: "재무담당자의 연락처가 변경되었습니다. 등록된 정보를 업데이트해..."
    }
  ];
  
  for (const company of companies) {
    // 각 회사마다 2-4개의 메시지 생성
    const messageCount = Math.floor(Math.random() * 3) + 2; // 2-4개
    
    for (let i = 0; i < messageCount; i++) {
      const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
      const messageId = generateGmailMessageId();
      const threadId = generateThreadId();
      
      // 회사별 이메일 도메인 설정
      const emailDomain = company.name.includes("증권") ? "securities.co.kr" :
                         company.name.includes("전자") ? "electronics.co.kr" :
                         company.name.includes("물산") ? "trading.co.kr" :
                         company.name.includes("금융") ? "finance.co.kr" :
                         company.name.includes("테크") ? "tech.co.kr" :
                         "company.co.kr";
      
      const senderEmail = `admin@${emailDomain}`;
      const recipientEmail = "support@finance-automation.co.kr";
      
      try {
        const message = createGmailMessage({
          message_id: messageId,
          thread_id: threadId,
          subject: `[${company.name}] ${template.subject}`,
          sender: senderEmail,
          recipient: recipientEmail,
          body: template.body,
          snippet: template.snippet,
          labels: JSON.stringify(["INBOX", "UNREAD"]),
          internal_date: getRandomRecentDate(),
          size_estimate: Math.floor(Math.random() * 5000) + 1000, // 1-6KB
          is_unread: Math.random() > 0.3, // 70% 확률로 읽지 않음
          has_attachments: Math.random() > 0.7, // 30% 확률로 첨부파일 있음
        });
        
        messages.push(message);
        console.log(`✓ Gmail 메시지 생성: ${company.name} - ${template.subject}`);
      } catch (error) {
        console.error(`✗ Gmail 메시지 생성 실패: ${company.name} - ${template.subject}`, error);
      }
    }
  }
  
  return messages;
}

/**
 * 모든 데모 데이터 생성
 */
export async function seedAllDemoData() {
  console.log("=== 데모 데이터 생성 시작 ===\n");
  
  try {
    // 1. 고객사 생성
    const companies = await seedCompanies();
    console.log(`고객사 ${companies.length}개 생성 완료\n`);
    
    // 2. 수권자 생성
    const authorizedPersons = await seedAuthorizedPersons(companies);
    console.log(`수권자 ${authorizedPersons.length}명 생성 완료\n`);
    
    // 3. 결제계좌 생성
    const paymentAccounts = await seedPaymentAccounts(companies);
    console.log(`결제계좌 ${paymentAccounts.length}개 생성 완료\n`);
    
    // 4. 인감 데이터 생성
    const officialSeals = await seedOfficialSeals(companies);
    console.log(`인감 데이터 ${officialSeals.length}개 생성 완료\n`);
    
    // 5. Gmail 메시지 생성
    const gmailMessages = await seedGmailMessages(companies);
    console.log(`Gmail 메시지 ${gmailMessages.length}개 생성 완료\n`);
    
    console.log("=== 데모 데이터 생성 완료 ===");
    console.log(`총 ${companies.length}개 회사, ${authorizedPersons.length}명 수권자, ${paymentAccounts.length}개 계좌, ${officialSeals.length}개 인감, ${gmailMessages.length}개 메시지 생성됨`);
    
    return {
      companies,
      authorizedPersons,
      paymentAccounts,
      officialSeals,
      gmailMessages,
    };
  } catch (error) {
    console.error("데모 데이터 생성 중 오류 발생:", error);
    throw error;
  }
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  seedAllDemoData()
    .then(() => {
      console.log("데모 데이터 생성이 완료되었습니다.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("데모 데이터 생성 실패:", error);
      process.exit(1);
    });
}
