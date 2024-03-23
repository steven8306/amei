import { useMessages } from 'components/hooks';
import Icons from 'components/icons';
import { useContext } from 'react';
import { Button, FormRow, Icon, Popup, PopupTrigger } from 'react-basics';
import FieldSelectForm from '../[reportId]/FieldSelectForm';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import { ReportContext } from '../[reportId]/Report';

export function InsightsFieldParameters() {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { parameters } = report || {};
  const { fields } = parameters || {};

  const fieldOptions = [
    { name: 'url', type: 'string', label: formatMessage(labels.url) },
    { name: 'title', type: 'string', label: formatMessage(labels.pageTitle) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'query', type: 'string', label: formatMessage(labels.query) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
  ];

  const handleAdd = (value: { name: any }) => {
    if (!fields.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { fields: fields.concat(value) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { fields: fields.filter(f => f.name !== name) } });
  };

  const AddButton = () => {
    return (
      <PopupTrigger>
        <Button size="sm">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Button>
        <Popup position="bottom" alignment="start">
          <PopupForm>
            <FieldSelectForm
              fields={fieldOptions.filter(({ name }) => !fields.find(f => f.name === name))}
              onSelect={handleAdd}
              showType={false}
            />
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <FormRow label={formatMessage(labels.fields)} action={<AddButton />}>
      <ParameterList>
        {fields.map(({ name }) => {
          return (
            <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
              {fieldOptions.find(f => f.name === name)?.label}
            </ParameterList.Item>
          );
        })}
      </ParameterList>
    </FormRow>
  );
}

export default InsightsFieldParameters;
