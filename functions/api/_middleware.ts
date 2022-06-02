import {verifySessionToken} from "@clerk/edge";
import {parse} from 'cookie';
import {verifySessionToken as CFWverifySessionToken } from "./utils/auth";

export async function onRequest<PagesFunction>({next, request, data, env}) {

  try {
    const cookie = parse(request.headers.get('Cookie'));
    let {__session} = cookie;
    let auth = request.headers.get('Authorization')?.match(/^Bearer (.*)$/)[1] || null;

    const authList = [];

    if (auth) {
      authList.push(CFWverifySessionToken(env.CLERK_JWT_KEY, auth));
      /**
       * FIXME: When enabled this throws and error regarding process and"crypto"
       */
      authList.push(verifySessionToken(env.CLERK_JWT_KEY, auth));
    }

    const [user, sessionUser = null] = await Promise.all(authList);
    data.user = user;
    data.sessionUser = sessionUser;

    return await next();
  } catch (e) {
    console.error(e)
    return await next();
  }

}
