# Finance Operating Automation

## 개요

금융기관의 고객 지원 업무를 자동화하는 AI 기반 시스템입니다. Gmail API를 활용하여 읽지 않은 메일을 자동으로 처리하고, LangChain과 ReAct 에이전트를 통해 고객 문의에 적절한 답변을 자동으로 생성합니다.

## 주요 기능

### 🤖 AI 기반 고객 지원 에이전트
- **ChatAgent**: 대화형 AI 어시스턴트로 자연어를 통한 시스템 조작
- **ReAct 에이전트 패턴**: 추론과 행동을 결합한 지능형 응답 생성
- **메모리 관리**: 대화 컨텍스트 유지로 일관성 있는 응답
- **멀티 도구 지원**: Gmail, 회사정보, 수권자, 결제계좌, 인감 관리 도구

### 📧 Gmail 자동화
- **읽지 않은 메일 자동 탐지**: Gmail API를 통한 실시간 메일 모니터링
- **자동 답장 생성**: AI 에이전트가 메일 내용 분석 후 적절한 답장 작성
- **메일 파싱**: HTML/텍스트 메일 내용 추출 및 정리

### 🛠️ 전문 가이드 도구
- **수권자 변경 가이드**: 법인 수권자 변경 절차 안내
- **인감/사인 변경 가이드**: 인감 및 서명 변경 프로세스 설명
- **결제계좌 변경 가이드**: 자동이체 계좌 변경 방법 제공

### 💬 ChatAgent - 대화형 AI 어시스턴트

ChatAgent는 사용자와 자연어로 소통하며 다양한 업무를 처리하는 대화형 AI 어시스턴트입니다.

#### 주요 기능
- 📬 **Gmail 관리**: 읽지 않은 메일 조회, 답장 메일 상태 확인
- 🏢 **회사 정보**: 고객 회사 정보 검색 및 조회
- 👥 **수권자 관리**: 수권자 정보 조회 및 변경 (이름, 이메일, 전화번호)
- 💳 **결제계좌 관리**: 결제계좌 정보 조회 및 변경 (은행명, 계좌번호, 예금주)
- 🔖 **인감/서명 관리**: 회사 인감 및 서명 정보 관리

#### 사용 예시
```typescript
import { invokeChatAgent, continueChatAgent } from '@/agents/ChatAgent/ChatAgent';

// 기본 사용법
const response = await invokeChatAgent(
  "ABC회사의 수권자 목록을 보여주세요."
);

// 연속 대화 (컨텍스트 유지)
const followUp = await continueChatAgent(
  "김수권 수권자의 전화번호를 010-1234-5678로 변경해주세요.",
  "session-id"
);
```

#### 테스트 및 예시 실행
```bash
# ChatAgent 기능 테스트
npx tsx packages/core/src/agents/ChatAgent/test.ts

# 사용 예시 실행
npx tsx packages/core/src/agents/ChatAgent/examples.ts

# 인터랙티브 모드 (대화형 테스트)
npx tsx packages/core/src/agents/ChatAgent/examples.ts --interactive
```

## 설치 및 실행

프로젝트를 로컬에서 실행하기 위해서는 다음 명령어를 순서대로 실행하세요:

```bash
pnpm install
pnpm build-and-start
```