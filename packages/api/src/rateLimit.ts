import { Redis } from "ioredis"

interface IRateLimit {
  category: string
  redis: Redis
  rate: number
  capacity: number
  consume: number
  identifier: string
  time?: number
}

export async function rateLimit({
  redis,
  category,
  capacity,
  rate,
  consume,
  identifier,
  time = Math.floor(Date.now() / 1000)
}: IRateLimit) {
  const script = `
    local tokens_key = KEYS[1]
    local timestamp_key = KEYS[2]
    
    local rate = tonumber(ARGV[1])
    local capacity = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = tonumber(ARGV[4])
    
    local fill_time = capacity/rate
    local ttl = math.floor(fill_time*2)
    
    local last_tokens = tonumber(redis.call("get", tokens_key))
    if last_tokens == nil then
      last_tokens = capacity
    end
    
    local last_refreshed = tonumber(redis.call("get", timestamp_key))
    if last_refreshed == nil then
      last_refreshed = 0
    end
    
    local delta = math.max(0, now-last_refreshed)
    local filled_tokens = math.min(capacity, last_tokens+(delta*rate))
    local allowed = filled_tokens >= requested
    local new_tokens = filled_tokens
    if allowed then
      new_tokens = filled_tokens - requested
    end
    
    redis.call("setex", tokens_key, ttl, new_tokens)
    redis.call("setex", timestamp_key, ttl, now)
    
    return { allowed, new_tokens }
    `

  const keys = [`${category}#${identifier}#t`, `${category}#${identifier}#e`]

  const args = [rate, capacity, time, consume]

  const [status, remaining]: [1 | null, number] = await redis.eval(
    script,
    keys.length,
    ...keys,
    ...args
  )

  return {
    allowed: status === 1,
    remaining
  }
}
