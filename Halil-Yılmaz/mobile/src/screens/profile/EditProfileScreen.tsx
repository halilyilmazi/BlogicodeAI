import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'> };

export default function EditProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateUser: updateAuthUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    profession: user?.profession ?? '',
    phone: user?.phone ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const isDirty = () =>
    form.firstName !== (user?.firstName ?? '') ||
    form.lastName !== (user?.lastName ?? '') ||
    form.username !== (user?.username ?? '') ||
    form.bio !== (user?.bio ?? '') ||
    form.profession !== (user?.profession ?? '') ||
    form.phone !== (user?.phone ?? '');

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'Ad zorunludur';
    if (!form.lastName.trim()) e.lastName = 'Soyad zorunludur';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      const updated = await updateUser(user._id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim() || undefined,
        bio: form.bio.trim() || undefined,
        profession: form.profession.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      updateAuthUser({ ...user, ...updated });
      Alert.alert('Başarılı', 'Profiliniz güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (!isDirty()) {
      navigation.goBack();
      return;
    }
    Alert.alert('Değişiklikler Kaydedilmedi', 'Değişikliklerinizi kaydetmeden çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.navBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleDiscard} style={styles.navBtn}>
          <Ionicons name="close" size={22} color={Colors.muted} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profili Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!isDirty() || loading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isDirty() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(form.firstName.charAt(0) + form.lastName.charAt(0)).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Ad *</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                value={form.firstName}
                onChangeText={set('firstName')}
                placeholder="Adınız"
                placeholderTextColor={Colors.muted}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Soyad *</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                value={form.lastName}
                onChangeText={set('lastName')}
                placeholder="Soyadınız"
                placeholderTextColor={Colors.muted}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={form.username}
              onChangeText={set('username')}
              placeholder="@kullaniciadi"
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Meslek</Text>
            <TextInput
              style={styles.input}
              value={form.profession}
              onChangeText={set('profession')}
              placeholder="Örn: Yazılım Mühendisi"
              placeholderTextColor={Colors.muted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="+90 555 000 00 00"
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Biyografi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={set('bio')}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor={Colors.muted}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{form.bio.length}/200</Text>
          </View>
        </View>

        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyLabel}>Email (değiştirilemez)</Text>
          <View style={styles.readOnlyField}>
            <Ionicons name="mail-outline" size={16} color={Colors.muted} />
            <Text style={styles.readOnlyText}>{user?.email}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navBtn: { padding: 6 },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  scroll: { paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  section: { paddingHorizontal: 20, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 13, color: Colors.muted, fontWeight: '500' },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 15,
  },
  textArea: { minHeight: 100 },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error },
  charCount: { fontSize: 12, color: Colors.muted, textAlign: 'right', marginTop: 4 },
  readOnlySection: { marginHorizontal: 20, marginTop: 20 },
  readOnlyLabel: { fontSize: 13, color: Colors.muted, marginBottom: 8 },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  readOnlyText: { color: Colors.muted, fontSize: 15 },
});
