import React from 'react';
import Layout from 'components/layout/Layout';
import { FormattedMessage } from 'react-intl';

export default function Custom404({ pageDisabled }) {
  if (pageDisabled) {
    return null;
  }

  return (
    <Layout>
      <div className="row justify-content-center">
        <h1>
          <FormattedMessage id="message.page-not-found" defaultMessage="Page not found" />
        </h1>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!process.env.DISABLE_UI,
    },
  };
}
