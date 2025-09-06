/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 어제 날짜를 Gmail API에서 사용하는 YYYY/MM/DD 형식으로 반환
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
}

/**
 * 특정 날짜 이후의 Gmail 검색 쿼리를 생성
 * @param date YYYY/MM/DD 형식의 날짜 문자열
 */
export function createAfterDateQuery(date: string): string {
  return `after:${date}`;
}

/**
 * 어제 날짜 이후의 Gmail 검색 쿼리를 생성
 */
export function createAfterYesterdayQuery(): string {
  return createAfterDateQuery(getYesterdayDateString());
}

/**
 * 날짜를 SQLite에서 사용할 수 있는 형식으로 변환
 * @param date YYYY/MM/DD 형식의 날짜 문자열
 * @returns YYYY-MM-DD 00:00:00 형식의 문자열
 */
export function convertToSQLiteDate(date: string): string {
  const [year, month, day] = date.split('/');
  return `${year}-${month}-${day} 00:00:00`;
}

/**
 * 어제 날짜를 SQLite 형식으로 반환
 */
export function getYesterdaySQLiteDate(): string {
  return convertToSQLiteDate(getYesterdayDateString());
}
