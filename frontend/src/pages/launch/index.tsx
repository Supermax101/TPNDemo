import { useCallback } from "react";
import { Button, Container } from "@mantine/core";
import { useRouter } from "next/router";

export default function LaunchScreen() {
  const router = useRouter();

  const onLaunchWithMock = useCallback(() => {
    // Navigate to mock patient flow
    router.push("/app/mock");
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #3fb6f5 0%, #91cef4 40%, #E0F4FF 70%, #FFFFFF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '20px 60px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          TakeoffAI
        </h1>
      </nav>

      {/* Main Content */}
      <Container size="xl" style={{ marginTop: '100px', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '600px',
          paddingLeft: '60px'
        }}>
          <h2 style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.2',
            marginBottom: '30px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Health optimization begins at birth
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'white',
            marginBottom: '40px',
            opacity: 0.95,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            At TakeoffAI, we leverage advanced AI to improve perinatal care.
          </p>
          
          <Button 
            onClick={onLaunchWithMock}
            size="lg"
            style={{
              backgroundColor: '#4A90E2',
              fontSize: '18px',
              padding: '12px 32px',
              height: 'auto',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Launch with Mock Patient
          </Button>
        </div>
      </Container>

      {/* Cloud decorations */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '250px',
        background: `
          radial-gradient(ellipse 400px 150px at 20% 100%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
          radial-gradient(ellipse 500px 180px at 60% 100%, rgba(255, 255, 255, 0.9) 0%, transparent 100%),
          radial-gradient(ellipse 450px 160px at 85% 100%, rgba(255, 255, 255, 0.85) 0%, transparent 100%)
        `,
        pointerEvents: 'none'
      }} />

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
}
