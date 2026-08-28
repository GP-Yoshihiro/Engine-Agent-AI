import bcrypt from 'bcryptjs';
import type { AppDatabase } from '../db/Database';

const PASSWORD_SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export class AuthError extends Error {}

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string;
}

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
}

/** アカウント登録・ログインを担うサービス。パスワードは平文で扱わずbcryptjsでハッシュ化する。 */
export class AuthService {
  constructor(private readonly db: AppDatabase) {}

  register(email: string, password: string, displayName: string): AuthenticatedUser {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();

    if (!normalizedEmail || !password || !trimmedDisplayName) {
      throw new AuthError('メールアドレス・パスワード・表示名は必須です。');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`);
    }

    const existing = this.db.raw
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(normalizedEmail);
    if (existing) {
      throw new AuthError('このメールアドレスは既に登録されています。');
    }

    const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);

    const result = this.db.raw
      .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
      .run(normalizedEmail, passwordHash, trimmedDisplayName);

    return {
      id: Number(result.lastInsertRowid),
      email: normalizedEmail,
      displayName: trimmedDisplayName,
    };
  }

  login(email: string, password: string): AuthenticatedUser {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.db.raw
      .prepare('SELECT id, email, password_hash, display_name FROM users WHERE email = ?')
      .get(normalizedEmail) as UserRow | undefined;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new AuthError('メールアドレスまたはパスワードが正しくありません。');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    };
  }
}
