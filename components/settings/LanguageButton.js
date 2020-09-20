import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Menu from 'components/common/Menu';
import Button from 'components/common/Button';
import { menuOptions } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import useDocumentClick from 'hooks/useDocumentClick';
import Globe from 'assets/globe.svg';
import styles from './LanguageButton.module.css';

export default function LanguageButton({ menuPosition = 'bottom', menuAlign = 'left' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [locale, setLocale] = useLocale();
  const ref = useRef();
  const selectedLocale = menuOptions.find(e => e.value === locale)?.display;

  function handleSelect(value) {
    setLocale(value);
    setShowMenu(false);
  }

  function toggleMenu() {
    setShowMenu(state => !state);
  }

  useDocumentClick(e => {
    if (!ref.current.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <>
      <Head>
        {locale === 'zh-CN' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'ja-JP' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        )}
      </Head>
      <div ref={ref} className={styles.container}>
        <Button icon={<Globe />} onClick={toggleMenu} variant="light">
          <div className={styles.text}>{selectedLocale}</div>
        </Button>
        {showMenu && (
          <Menu
            className={styles.menu}
            options={menuOptions}
            onSelect={handleSelect}
            float={menuPosition}
            align={menuAlign}
          />
        )}
      </div>
    </>
  );
}
