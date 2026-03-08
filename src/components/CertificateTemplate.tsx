import { forwardRef } from 'react';
import logoImage from '../assets/logo.png';
import signatureImage from '../assets/signature.png';

interface CertificateTemplateProps {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  verificationCode: string;
  certificateId: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseTitle, issueDate, verificationCode, certificateId }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '1056px',
          height: '816px',
          backgroundColor: '#ffffff',
          padding: '48px',
          position: 'relative',
          fontFamily: 'Georgia, serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Double Border */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            right: '24px',
            bottom: '24px',
            border: '12px solid #059669',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              border: '2px solid #059669',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '32px',
            paddingBottom: '32px',
          }}
        >
          {/* Header Section */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
              <img
                src={logoImage}
                alt="WasteInstitute"
                style={{ height: '80px', margin: '0 auto', display: 'block' }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#059669',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                  marginTop: '0',
                }}
              >
                Certificate of Completion
              </h1>
              <div
                style={{
                  height: '4px',
                  width: '200px',
                  backgroundColor: '#059669',
                  margin: '0 auto',
                }}
              />
            </div>

            <p style={{ fontSize: '18px', color: '#4B5563', marginBottom: '24px' }}>
              This is to certify that
            </p>

            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#00112b',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '8px',
                }}
              >
                {studentName}
              </p>
              <div
                style={{
                  height: '2px',
                  width: '400px',
                  backgroundColor: '#d1d5db',
                  margin: '0 auto',
                }}
              />
            </div>

            <p style={{ fontSize: '18px', color: '#4B5563', marginBottom: '20px' }}>
              has successfully completed the course
            </p>

            <div style={{ marginBottom: '20px' }}>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#059669',
                  padding: '0 32px',
                }}
              >
                {courseTitle}
              </p>
            </div>

            <p style={{ fontSize: '16px', color: '#4B5563' }}>
              Awarded on{' '}
              {new Date(issueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Footer Section */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingLeft: '64px',
              paddingRight: '64px',
              marginTop: '32px',
            }}
          >
            {/* Signature */}
            <div style={{ textAlign: 'center' }}>
              <img
                src={signatureImage}
                alt="Signature"
                style={{
                  height: '60px',
                  marginBottom: '8px',
                  display: 'block',
                  margin: '0 auto 8px auto',
                  filter: 'grayscale(100%)',
                }}
              />
              <div
                style={{
                  height: '2px',
                  width: '200px',
                  backgroundColor: '#00112b',
                  margin: '0 auto 8px auto',
                }}
              />
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#00112b',
                  marginBottom: '4px',
                  marginTop: '0',
                }}
              >
                Laura Jones
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#4B5563',
                  marginBottom: '2px',
                  marginTop: '0',
                }}
              >
                Courses Director
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#4B5563',
                  fontWeight: '600',
                  marginTop: '4px',
                }}
              >
                WasteInstitute.org
              </p>
            </div>

            {/* Certificate Details */}
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  marginBottom: '2px',
                  marginTop: '0',
                  fontFamily: 'monospace',
                }}
              >
                Certificate ID
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00112b',
                  marginBottom: '12px',
                  marginTop: '0',
                  fontFamily: 'monospace',
                }}
              >
                {certificateId}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  marginBottom: '2px',
                  marginTop: '0',
                  fontFamily: 'monospace',
                }}
              >
                Verification Code
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00112b',
                  marginBottom: '8px',
                  marginTop: '0',
                  fontFamily: 'monospace',
                }}
              >
                {verificationCode}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  marginTop: '8px',
                  marginBottom: '0',
                }}
              >
                Verify at wasteinstitute.org/verify
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
