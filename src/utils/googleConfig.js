import { google } from "googleapis";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

export const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "https://be2b24b4-17b5-46f4-844f-86d937295ae3.e1-us-east-azure.choreoapps.dev/api/v1/users/auth/google"
)
