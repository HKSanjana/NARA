import Image from 'next/image';
import Link from 'next/link';

export default function SriLankaMap() {
  return (
    <div style={{ position: 'relative', width: 500, height: 600 }}>
      {/* Sri Lanka Map */}
      <Image
        src="/sri-lanka-map.png"
        alt="Sri Lanka Map"
        layout="fill"
        objectFit="contain"
      />

      {/* Clickable Point - Colombo */}
      <Link href="/colombo">
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '40%',
          width: '20px',
          height: '20px',
          backgroundColor: 'red',
          borderRadius: '50%',
          cursor: 'pointer',
        }} title="Colombo"></div>
      </Link>

      {/* Clickable Point - Galle */}
      <Link href="/galle">
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '45%',
          width: '20px',
          height: '20px',
          backgroundColor: 'blue',
          borderRadius: '50%',
          cursor: 'pointer',
        }} title="Galle"></div>
      </Link>
    </div>
  );
}
