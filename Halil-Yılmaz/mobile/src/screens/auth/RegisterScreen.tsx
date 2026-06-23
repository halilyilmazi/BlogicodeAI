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
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const passwordStrength = (pw: string): { level: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: score, label: 'Zayıf', color: Colors.error };
  if (score <= 3) return { level: score, label: 'Orta', color: Colors.warning };
  return { level: score, label: 'Güçlü', color: Colors.success };
};

export default function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = 'Ad zorunludur';
    if (!form.lastName.trim()) e.lastName = 'Soyad zorunludur';
    if (!form.email.trim()) e.email = 'Email zorunludur';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli bir email girin';
    if (!form.password) e.password = 'Şifre zorunludur';
    else if (form.password.length < 8) e.password = 'Şifre en az 8 karakter olmalı';
    else if (!/[A-Z]/.test(form.password)) e.password = 'En az bir büyük harf içermeli';
    else if (!/\d/.test(form.password)) e.password = 'En az bir rakam içermeli';
    if (!form.confirmPassword) e.confirmPassword = 'Şifre tekrarı zorunludur';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Şifreler eşleşmiyor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await signIn(user, token);
    } catch (err: any) {
      const msg = err.message?.includes('409') || err.message?.toLowerCase().includes('exist')
        ? 'Bu email zaten kullanılıyor'
        : err.message || 'Kayıt başarısız';
      Alert.alert('Kayıt Hatası', msg);
    } finally {
      setLoading(false);
    }
  };

  const allFilled =
    form.firstName && form.lastName && form.email && form.password && form.confirmPassword;
  const strength = passwordStrength(form.password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>BlogicodeAI</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Ad</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                placeholder="Adınız"
                placeholderTextColor={Colors.muted}
                value={form.firstName}
                onChangeText={set('firstName')}
                autoCorrect={false}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Soyad</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                placeholder="Soyadınız"
                placeholderTextColor={Colors.muted}
                value={form.lastName}
                onChangeText={set('lastName')}
                autoCorrect={false}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="ornek@mail.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={form.email}
              onChangeText={set('email')}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.inputRow, errors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.inputFlex}
                placeholder="En az 8 karakter"
                placeholderTextColor={Colors.muted}
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={set('password')}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
            {form.password.length > 0 && (
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      { backgroundColor: i <= strength.level ? strength.color : Colors.border },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={[styles.inputRow, errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.inputFlex}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={Colors.muted}
                secureTextEntry={!showConfirm}
                value={form.confirmPassword}
                onChangeText={set('confirmPassword')}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, (!allFilled || loading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!allFilled || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Zaten hesabınız var mı?{' '}
              <Text style={styles.linkHighlight}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '700', color: Colors.primaryLight, letterSpacing: 1 },
  subtitle: { fontSize: 15, color: Colors.muted, marginTop: 6 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputFlex: { flex: 1, paddingVertical: 14, color: Colors.text, fontSize: 15 },
  eyeBtn: { padding: 4 },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error },
  strengthBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: Colors.muted, fontSize: 14 },
  linkHighlight: { color: Colors.primaryLight, fontWeight: '600' },
});
