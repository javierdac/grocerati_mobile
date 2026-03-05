import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import QRCode from 'qrcode';

export default function QRCodeView({ value, size = 180 }) {
  const [grid, setGrid] = useState(null);

  useEffect(() => {
    if (!value) return;
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
      setGrid({ data: Array.from(qr.modules.data), count: qr.modules.size });
    } catch {}
  }, [value]);

  if (!grid) return null;

  const cellSize = size / grid.count;

  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
      {grid.data.map((bit, i) => (
        <View
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: bit ? '#333' : '#fff',
          }}
        />
      ))}
    </View>
  );
}
