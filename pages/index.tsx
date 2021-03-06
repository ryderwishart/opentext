import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <Layout pageTitle="Register Analysis of the Gospels" pageDescription={'Documentation and data for Ryder Wishart\'s dissertation'}>
      <div className={styles.card}>
        <Link href="/situations">
          <a>Situations</a>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/clusters">
          <a>Situation Types</a>
        </Link>
      </div>
      <div className={styles.card}>
        <Link href="/appendix">
          <a>Appendices</a>
        </Link>
      </div>
    </Layout>
  );
}
