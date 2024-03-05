import { type StrapiTheme } from '@strapi/design-system';
import { type BaseEditor } from 'slate';
import { type HistoryEditor } from 'slate-history';
import { type ReactEditor } from 'slate-react';

import { type LinkEditor } from '../../admin/src/content-manager/pages/EditView/components/FormInputs/BlocksInput/plugins/withLinks';

import type { FeaturesConfig, Attribute } from '@strapi/types';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends StrapiTheme {}
}

declare module 'slate' {
  interface CustomTypes {
    Editor: Omit<BaseEditor & ReactEditor & HistoryEditor & LinkEditor, 'children'> & {
      children: Attribute.BlocksValue;
    };
    Element: Attribute.BlocksNode;
    Descendant: Attribute.BlocksInlineNode | Text;
    Text: Attribute.BlocksTextNode;
  }
}

declare global {
  interface Window {
    strapi: {
      backendURL: string;
      isEE: boolean;
      future: {
        isEnabled: (name: keyof FeaturesConfig['future']) => boolean;
      };
      features: {
        SSO: 'sso';
        AUDIT_LOGS: 'audit-logs';
        REVIEW_WORKFLOWS: 'review-workflows';
        isEnabled: (featureName?: string) => boolean;
      };
      flags: {
        promoteEE?: boolean;
        nps?: boolean;
      };
      projectType: 'Community' | 'Enterprise';
      telemetryDisabled: boolean;
    };
  }
}
