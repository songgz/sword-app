export class User {
  id?: string;
  acct_no?: string;
  avatar?: string;
  name?: string;
  school_name?: string;
  school_id?: string;
  vip_days?: number;
  grade?: string;
  birthday?: string;

  getId() {
    return this.id || '';
  }
}
