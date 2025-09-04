import { describe, it, expect } from 'vitest'
import {
  extractEmail,
  headersToRecord,
  getHeader,
  extractTextFromPayload,
} from './mailParser'
import type { gmail_v1 } from 'googleapis'

describe('mailParser', () => {
  describe('extractEmail', () => {
    it('should extract an email from a string', () => {
      const text = 'Contact me at test@example.com'
      expect(extractEmail(text)).toBe('test@example.com')
    })

    it('should return null if no email is found', () => {
      const text = 'There is no email here'
      expect(extractEmail(text)).toBeNull()
    })

    it('should extract the first email if multiple are present', () => {
      const text = 'Emails: first@example.com, second@example.com'
      expect(extractEmail(text)).toBe('first@example.com')
    })

    it('should handle complex email formats', () => {
      const text = '<john.doe+123@example.co.uk>'
      expect(extractEmail(text)).toBe('john.doe+123@example.co.uk')
    })
  })

  describe('headersToRecord', () => {
    it('should convert an array of headers to a record', () => {
      const headers: gmail_v1.Schema$MessagePartHeader[] = [
        { name: 'From', value: 'sender@example.com' },
        { name: 'To', value: 'receiver@example.com' },
        { name: 'Subject', value: 'Test Email' },
      ]
      const expected = {
        From: 'sender@example.com',
        To: 'receiver@example.com',
        Subject: 'Test Email',
      }
      expect(headersToRecord(headers)).toEqual(expected)
    })

    it('should handle empty headers array', () => {
      const headers: gmail_v1.Schema$MessagePartHeader[] = []
      expect(headersToRecord(headers)).toEqual({})
    })

    it('should handle headers with missing name or value', () => {
      const headers: gmail_v1.Schema$MessagePartHeader[] = [
        { name: 'From', value: 'sender@example.com' },
        { name: 'Incomplete' },
        { value: 'NoName' },
      ]
      const expected = {
        From: 'sender@example.com',
      }
      expect(headersToRecord(headers)).toEqual(expected)
    })
  })

  describe('getHeader', () => {
    const headers: gmail_v1.Schema$MessagePartHeader[] = [
      { name: 'From', value: 'sender@example.com' },
      { name: 'Subject', value: 'Test Email' },
    ]

    it('should return the value of an existing header', () => {
      expect(getHeader(headers, 'From')).toBe('sender@example.com')
    })

    it('should be case-insensitive', () => {
      expect(getHeader(headers, 'subject')).toBe('Test Email')
    })

    it('should return undefined for a non-existing header', () => {
      expect(getHeader(headers, 'To')).toBeUndefined()
    })
  })

  describe('extractTextFromPayload', () => {
    it('should extract text from a simple text/plain payload', () => {
      const payload: gmail_v1.Schema$MessagePart = {
        mimeType: 'text/plain',
        body: {
          data: Buffer.from('Hello, world!').toString('base64url'),
        },
      }
      expect(extractTextFromPayload(payload)).toBe('Hello, world!')
    })

    it('should extract and convert text from a simple text/html payload', () => {
      const payload: gmail_v1.Schema$MessagePart = {
        mimeType: 'text/html',
        body: {
          data: Buffer.from('<h1>Hello, world!</h1>').toString('base64url'),
        },
      }
      expect(extractTextFromPayload(payload)).toBe('Hello, world!')
    })

    it('should prioritize text/plain over text/html in multipart/alternative', () => {
      const payload: gmail_v1.Schema$MessagePart = {
        mimeType: 'multipart/alternative',
        parts: [
          {
            mimeType: 'text/plain',
            body: {
              data: Buffer.from('This is plain text.').toString('base64url'),
            },
          },
          {
            mimeType: 'text/html',
            body: {
              data: Buffer.from('<h1>This is HTML</h1>').toString('base64url'),
            },
          },
        ],
      }
      expect(extractTextFromPayload(payload)).toBe('This is plain text.')
    })

    it('should use text/html if text/plain is not available', () => {
        const payload: gmail_v1.Schema$MessagePart = {
            mimeType: 'multipart/alternative',
            parts: [
                {
                    mimeType: 'text/html',
                    body: {
                        data: Buffer.from('<h1>This is HTML</h1>').toString('base64url'),
                    },
                },
            ],
        };
        expect(extractTextFromPayload(payload)).toBe('This is HTML');
    });


    it('should handle nested multipart messages', () => {
      const payload: gmail_v1.Schema$MessagePart = {
        mimeType: 'multipart/mixed',
        parts: [
          {
            mimeType: 'multipart/alternative',
            parts: [
              {
                mimeType: 'text/plain',
                body: {
                  data: Buffer.from('Nested plain text.').toString('base64url'),
                },
              },
              {
                mimeType: 'text/html',
                body: {
                  data: Buffer.from('<h1>Nested HTML</h1>').toString('base64url'),
                },
              },
            ],
          },
          {
            mimeType: 'application/octet-stream',
            filename: 'attachment.txt',
            body: {
              attachmentId: 'some-id',
            },
          },
        ],
      }
      expect(extractTextFromPayload(payload)).toBe('Nested plain text.')
    })

    it('should return an empty string for an empty payload', () => {
      const payload: gmail_v1.Schema$MessagePart = {}
      expect(extractTextFromPayload(payload)).toBe('')
    })
  })
})
