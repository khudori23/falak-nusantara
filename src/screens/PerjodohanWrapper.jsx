import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, BackHandler } from 'react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import KecocokanHomeScreen from './kecocokan/KecocokanHomeScreen';
import JawaWetonScreen from './kecocokan/JawaWetonScreen';
import JawaSalakiRabiScreen from './kecocokan/JawaSalakiRabiScreen';
import JawaUnsurHariScreen from './kecocokan/JawaUnsurHariScreen';
import AbuMasyarRamlScreen from './kecocokan/AbuMasyarRamlScreen';
import AbuMasyarBurujScreen from './kecocokan/AbuMasyarBurujScreen';
import AkadNikahScreen from './kecocokan/AkadNikahScreen';

export default function PerjodohanWrapper({ onNavigate }) {
  const [screen, setScreen] = useState('home');
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    const backAction = () => {
      if (screenRef.current !== 'home') {
        setScreen('home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleOpenCaraKerja = () => {
    Alert.alert('Bagaimana cara kerjanya?', 'Penjelasan detail akan ditambahkan di sini.');
  };

  function renderScreen() {
    switch (screen) {
      case 'home':
        return (
          <KecocokanHomeScreen
            onSelect={setScreen}
            onOpenSettings={() => onNavigate('Settings')}
            onOpenCaraKerja={handleOpenCaraKerja}
          />
        );
      case 'jawa-weton':
        return <JawaWetonScreen onBack={() => setScreen('home')} />;
      case 'jawa-salakirabi':
        return <JawaSalakiRabiScreen onBack={() => setScreen('home')} />;
      case 'jawa-unsurhari':
        return <JawaUnsurHariScreen onBack={() => setScreen('home')} />;
      case 'abu-raml':
        return <AbuMasyarRamlScreen onBack={() => setScreen('home')} />;
      case 'abu-buruj':
        return <AbuMasyarBurujScreen onBack={() => setScreen('home')} />;
      case 'akad-nikah':
        return <AkadNikahScreen onBack={() => setScreen('home')} />;
      default:
        return (
          <KecocokanHomeScreen
            onSelect={setScreen}
            onOpenSettings={() => onNavigate('Settings')}
            onOpenCaraKerja={handleOpenCaraKerja}
          />
        );
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      <BottomNav active={null} onNavigate={onNavigate} />
    </View>
  );
}
