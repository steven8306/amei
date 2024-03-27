import { useState, useMemo } from 'react';
import {
  Form,
  FormRow,
  Item,
  Flexbox,
  Dropdown,
  Button,
  SearchField,
  TextField,
  Text,
  Icon,
  Icons,
  Menu,
  Loading,
} from 'react-basics';
import { useMessages, useFilters, useFormat, useLocale, useWebsiteValues } from 'components/hooks';
import { OPERATORS } from 'lib/constants';
import styles from './FieldFilterEditForm.module.css';

export interface FieldFilterFormProps {
  websiteId?: string;
  name: string;
  label?: string;
  type: string;
  startDate: Date;
  endDate: Date;
  operator?: string;
  defaultValue?: string;
  onChange?: (filter: { name: string; type: string; operator: string; value: string }) => void;
  allowFilterSelect?: boolean;
  isNew?: boolean;
}

export default function FieldFilterEditForm({
  websiteId,
  name,
  label,
  type,
  startDate,
  endDate,
  operator: defaultOperator = 'eq',
  defaultValue = '',
  onChange,
  allowFilterSelect = true,
  isNew,
}: FieldFilterFormProps) {
  const { formatMessage, labels } = useMessages();
  const [operator, setOperator] = useState(defaultOperator);
  const [value, setValue] = useState(defaultValue);
  const [showMenu, setShowMenu] = useState(false);
  const isEquals = [OPERATORS.equals, OPERATORS.notEquals].includes(operator as any);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(isEquals ? value : '');
  const { getFilters } = useFilters();
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const filters = getFilters(type);
  const isDisabled = !operator || (isEquals && !selected) || (!isEquals && !value);
  const {
    data: values = [],
    isLoading,
    refetch,
  } = useWebsiteValues({
    websiteId,
    type: name,
    startDate,
    endDate,
    search,
  });

  const formattedValues = useMemo(() => {
    if (!values) {
      return {};
    }
    const formatted = {};
    const format = (val: string) => {
      formatted[val] = formatValue(val, name);
      return formatted[val];
    };

    if (values?.length !== 1) {
      const { compare } = new Intl.Collator(locale, { numeric: true });
      values.sort((a, b) => compare(formatted[a] ?? format(a), formatted[b] ?? format(b)));
    } else {
      format(values[0]);
    }

    return formatted;
  }, [formatValue, locale, name, values]);

  const filteredValues = useMemo(() => {
    return value
      ? values.filter((n: string | number) =>
          formattedValues[n].toLowerCase().includes(value.toLowerCase()),
        )
      : values;
  }, [value, formattedValues]);

  const renderFilterValue = (value: any) => {
    return filters.find((f: { value: any }) => f.value === value)?.label;
  };

  const handleAdd = () => {
    onChange({ name, type, operator, value: isEquals ? selected : value });
  };

  const handleMenuSelect = (close: () => void, value: string) => {
    setSelected(value);
    close();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSelected('');
    setValue('');
    setSearch('');
    refetch();
  };

  const handleOperatorChange = (value: any) => {
    setOperator(value);

    if ([OPERATORS.equals, OPERATORS.notEquals].includes(value)) {
      setValue('');
    } else {
      setSelected('');
    }
  };

  const handleBlur = () => {
    window.setTimeout(() => setShowMenu(false), 500);
  };

  return (
    <Form>
      <FormRow label={label} className={styles.filter}>
        <Flexbox gap={10}>
          {allowFilterSelect && (
            <Dropdown
              className={styles.dropdown}
              items={filters}
              value={operator}
              renderValue={renderFilterValue}
              onChange={handleOperatorChange}
            >
              {({ value, label }) => {
                return <Item key={value}>{label}</Item>;
              }}
            </Dropdown>
          )}
          {selected && isEquals && (
            <div className={styles.selected} onClick={handleReset}>
              <Text>{selected}</Text>
              <Icon>
                <Icons.Close />
              </Icon>
            </div>
          )}
          {!selected && isEquals && (
            <div className={styles.search}>
              <SearchField
                className={styles.text}
                value={value}
                placeholder={formatMessage(labels.enter)}
                onChange={e => setValue(e.target.value)}
                onSearch={handleSearch}
                delay={500}
                onFocus={() => setShowMenu(true)}
                onBlur={handleBlur}
              />
              {showMenu && (
                <ResultsMenu
                  values={filteredValues}
                  type={name}
                  isLoading={isLoading}
                  onSelect={handleMenuSelect.bind(null, close)}
                />
              )}
            </div>
          )}
          {!selected && !isEquals && (
            <TextField
              className={styles.text}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          )}
        </Flexbox>
        <Button variant="primary" onClick={handleAdd} disabled={isDisabled}>
          {isNew ? formatMessage(labels.add) : formatMessage(labels.update)}
        </Button>
      </FormRow>
    </Form>
  );
}

const ResultsMenu = ({ values, type, isLoading, onSelect }) => {
  const { formatValue } = useFormat();
  if (isLoading) {
    return (
      <Menu>
        <Item>
          <Loading icon="dots" position="center" />
        </Item>
      </Menu>
    );
  }

  if (!values?.length) {
    return <h1>poop</h1>;
  }

  return (
    <Menu className={styles.menu} variant="popup" onSelect={onSelect}>
      {values?.map(value => {
        return <Item key={value}>{formatValue(value, type)}</Item>;
      })}
    </Menu>
  );
};
