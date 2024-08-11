export interface GoogleUserInfo {
  id: string; // The user's ID
  name: string; // The user's full name
  given_name: string; // The user's first name
  family_name: string; // The user's last name
  picture: string; // The URL of the user's profile picture
  email: string; // The user's email address
  email_verified: boolean; // Whether the user's email is verified
  locale: string; // The user's locale (e.g., "en")
}
