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
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email zorunludur';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Geçerli bir email girin';
    if (!password) e.password = 'Şifre zorunludur';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await login({ email: email.trim(), password });
      await signIn(user, token);
    } catch (err: any) {
      Alert.alert('Giriş Hatası', err.message || 'Email veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !email || !password || loading;

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
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="ornek@mail.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.inputRow, errors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.inputFlex}
                placeholder="Şifrenizi girin"
                placeholderTextColor={Colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Hesabınız yok mu?{' '}
              <Text style={styles.linkHighlight}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: '700', color: Colors.primaryLight, letterSpacing: 1 },
  subtitle: { fontSize: 15, color: Colors.muted, marginTop: 8 },
  form: { gap: 16 },
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
  errorText: { fontSize: 12, color: Colors.error, marginTop: 2 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: Colors.muted, fontSize: 14 },
  linkHighlight: { color: Colors.primaryLight, fontWeight: '600' },
});
