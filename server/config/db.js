
import mongoose from 'mongoose';
import dns from 'dns';

const applyDNSFallback = () => {
  const fallback = process.env.DNS_FALLBACK_SERVER;

  if (!fallback) return;

  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(fallback);
  const isIPv6 = /^[0-9a-fA-F:]+$/.test(fallback);

  if (!isIPv4 && !isIPv6) {
    console.warn('Invalid DNS_FALLBACK_SERVER. Ignoring.');
    return;
  }

  const current = dns.getServers();

  if (!current.includes(fallback)) {
    dns.setServers([...current, fallback]);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  applyDNSFallback();

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectDB;
