import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Connect to MongoDB Atlas using the MONGO_URI environment variable.
 *
 * DNS_FALLBACK_SERVER (optional, local .env only)
 * ------------------------------------------------
 * On some Windows machines, Node's embedded c-ares DNS resolver inherits
 * a loopback stub (127.0.0.1) from a VPN client or WSL2 network stack.
 * That stub handles A/AAAA queries but refuses SRV queries, which causes
 * mongodb+srv:// URIs to fail with ECONNREFUSED even though the Atlas host
 * is reachable via the OS resolver.
 *
 * Setting DNS_FALLBACK_SERVER (e.g. "8.8.8.8") in your local server/.env
 * appends that address to c-ares' server list so SRV lookups succeed.
 *
 * WARNING: dns.setServers() is a GLOBAL change — it affects all DNS
 * resolution in this Node.js process for its entire lifetime, including
 * every library that makes outbound requests.  Only set this variable when
 * the local resolver genuinely cannot resolve SRV records.  Leave it unset
 * in CI and production environments where the system resolver works correctly.
 */
const applyDNSFallback = () => {
  const fallback = process.env.DNS_FALLBACK_SERVER;

  if (!fallback) return; // not configured — skip entirely

  // Basic validation: must look like an IPv4 or IPv6 address, not a hostname.
  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(fallback);
  const isIPv6 = /^[0-9a-fA-F:]+$/.test(fallback);

  if (!isIPv4 && !isIPv6) {
    console.warn(
      `DNS_FALLBACK_SERVER "${fallback}" does not look like an IP address — ignoring.`,
    );
    return;
  }

  const current = dns.getServers();
  if (current.includes(fallback)) return; // already present, nothing to do

  dns.setServers([...current, fallback]);
  console.log(
    `DNS fallback applied: appended ${fallback} to c-ares resolver list. ` +
    `This change is global for this process.`,
  );
};

const connectDB = async () => {
  applyDNSFallback();

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
