import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Menu from './Menu';
import Icon from './Icon';
import Button from './Button';
import useDocumentClick from 'hooks/useDocumentClick';
import User from 'assets/user.svg';
import Chevron from 'assets/chevron-down.svg';
import styles from './UserButton.module.css';

export default function UserButton() {
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector(state => state.user);
  const ref = useRef();
  const router = useRouter();

  const menuOptions = [
    {
      label: (
        <FormattedMessage
          id="label.logged-in-as"
          defaultMessage="Logged in as {username}"
          values={{ username: <b>{user.username}</b> }}
        />
      ),
      value: 'username',
      className: styles.username,
    },
    { label: <FormattedMessage id="label.profile" defaultMessage="Profile" />, value: 'profile' },
    { label: <FormattedMessage id="label.logout" defaultMessage="Logout" />, value: 'logout' },
  ];

  function handleSelect(value) {
    setShowMenu(false);

    if (value === 'logout') {
      router.push('/logout');
    } else if (value === 'profile') {
      router.push('/settings/profile');
    }
  }

  useDocumentClick(e => {
    if (!ref.current.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <div ref={ref} className={styles.container}>
      <Button
        icon={<User />}
        className={styles.button}
        onClick={() => setShowMenu(state => !state)}
        size="large"
        variant="light"
      >
        <Icon icon={<Chevron />} size="small" />
      </Button>
      {showMenu && (
        <Menu
          className={styles.menu}
          options={menuOptions}
          onSelect={handleSelect}
          float="bottom"
          align="right"
        />
      )}
    </div>
  );
}
