import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimi gerekli.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişimi gerekli.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function pickImageOrCamera(): Promise<string | null> {
  return new Promise(resolve => {
    Alert.alert(
      'Fotoğraf Seç',
      '',
      [
        { text: 'Galeriden Seç', onPress: () => pickImage().then(resolve) },
        { text: 'Fotoğraf Çek',  onPress: () => takePhoto().then(resolve) },
        { text: 'İptal', style: 'cancel', onPress: () => resolve(null) },
      ]
    );
  });
}
