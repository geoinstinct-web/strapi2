import React from 'react';
import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { useIntl } from 'react-intl';
import { Box } from '@strapi/parts/Box';
import { Row } from '@strapi/parts/Row';
import { Stack } from '@strapi/parts/Stack';
import { H3 } from '@strapi/parts/Text';
import { SimpleMenu, MenuItem } from '@strapi/parts/SimpleMenu';
import { IconButton } from '@strapi/parts/IconButton';
import AddIcon from '@strapi/icons/AddIcon';
import DraggableCard from './DraggableCard';
import { getTrad } from '../../../utils';

const Flex = styled(Box)`
  flex: ${({ size }) => size};
`;

const ScrollableContainer = styled(Flex)`
  overflow-x: scroll;
  overflow-y: hidden;
`;

const SelectContainer = styled(Flex)`
  max-width: ${32 / 16}rem;
`;

const View = ({ listRemainingFields, displayedFields, handleAddField, handleRemoveField }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box paddingBottom={4}>
        <H3 as="h2">
          {formatMessage({
            id: getTrad('containers.SettingPage.view'),
            defaultMessage: 'View',
          })}
        </H3>
      </Box>
      <Row
        paddingTop={4}
        paddingLeft={4}
        paddingRight={4}
        borderColor="neutral300"
        borderStyle="dashed"
        borderWidth="1px"
        hasRadius
      >
        <ScrollableContainer size="1" paddingBottom={4}>
          <Stack horizontal size={3}>
            {displayedFields.map((field, index) => (
              <DraggableCard
                onRemoveField={e => handleRemoveField(e, index)}
                key={field}
                title={field}
              />
            ))}
          </Stack>
        </ScrollableContainer>
        <SelectContainer size="auto" paddingBottom={4}>
          <SimpleMenu
            label={formatMessage({
              id: getTrad('components.FieldSelect.label'),
              defaultMessage: 'Add a field',
            })}
            as={IconButton}
            icon={<AddIcon />}
            disabled={listRemainingFields.length <= 0}
            data-testid="add-field"
          >
            {listRemainingFields.map(field => (
              <MenuItem key={field} onClick={() => handleAddField(field)}>
                {field}
              </MenuItem>
            ))}
          </SimpleMenu>
        </SelectContainer>
      </Row>
    </>
  );
};

View.propTypes = {
  displayedFields: PropTypes.array.isRequired,
  handleAddField: PropTypes.func.isRequired,
  handleRemoveField: PropTypes.func.isRequired,
  listRemainingFields: PropTypes.array.isRequired,
};

export default View;
