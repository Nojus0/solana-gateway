export interface UserRedisObject {
  /**
   * User Email Address
   */
  u: string;

  /**
   * REQUESTS TO REDIS
   */
  rq: number;

  /**
   * Network Name
   */
  n: string;
}

/**
 * Indexed by the deposit wallet public key.
 */
export interface DepositRedisObject {
  /**
   * User Email Address
   */
  u: string;

  /**
   * User specified payload
   */
  d: string;

  /**
   * The wallets secret key
   */
  secret: string;

  /**
   * Network Name
   */
  n: string;
}
