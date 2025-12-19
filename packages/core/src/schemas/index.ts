/**
 * JSON Schema definitions for ClaudeCanvas
 * These can be used to validate agent output and for Claude's structured output
 */

export const componentSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    JsonPointer: {
      type: 'string',
      pattern: '^/.*$',
      description: 'JSON Pointer path for data binding',
    },
    Spacing: {
      oneOf: [
        { type: 'number' },
        {
          type: 'object',
          properties: {
            top: { type: 'number' },
            right: { type: 'number' },
            bottom: { type: 'number' },
            left: { type: 'number' },
          },
        },
      ],
    },
    ComponentStyle: {
      type: 'object',
      properties: {
        padding: { $ref: '#/definitions/Spacing' },
        margin: { $ref: '#/definitions/Spacing' },
        backgroundColor: { type: 'string' },
        borderRadius: { type: 'number' },
        borderColor: { type: 'string' },
        borderWidth: { type: 'number' },
        width: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        height: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        flex: { type: 'number' },
        opacity: { type: 'number', minimum: 0, maximum: 1 },
      },
    },
    Action: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { enum: ['submit', 'navigate', 'dismiss', 'custom'] },
        event: { type: 'string' },
        payload: { type: 'object' },
        dataPath: { $ref: '#/definitions/JsonPointer' },
      },
    },
    BaseComponent: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        style: { $ref: '#/definitions/ComponentStyle' },
        visibleIf: { $ref: '#/definitions/JsonPointer' },
      },
    },
    TextComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component'],
          properties: {
            component: { const: 'Text' },
            content: { type: 'string' },
            contentPath: { $ref: '#/definitions/JsonPointer' },
            textStyle: { enum: ['heading1', 'heading2', 'heading3', 'body', 'caption', 'code'] },
            color: { type: 'string' },
            markdown: { type: 'boolean' },
          },
        },
      ],
    },
    ButtonComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component', 'label', 'action'],
          properties: {
            component: { const: 'Button' },
            label: { type: 'string' },
            variant: { enum: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
            icon: { type: 'string' },
            disabled: { type: 'boolean' },
            loading: { type: 'boolean' },
            action: { $ref: '#/definitions/Action' },
          },
        },
      ],
    },
    RowComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component', 'children'],
          properties: {
            component: { const: 'Row' },
            children: { type: 'array', items: { $ref: '#/definitions/Component' } },
            gap: { type: 'number' },
            align: { enum: ['start', 'center', 'end', 'stretch', 'spaceBetween', 'spaceAround'] },
            justify: { enum: ['start', 'center', 'end', 'stretch', 'spaceBetween', 'spaceAround'] },
            wrap: { type: 'boolean' },
          },
        },
      ],
    },
    ColumnComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component', 'children'],
          properties: {
            component: { const: 'Column' },
            children: { type: 'array', items: { $ref: '#/definitions/Component' } },
            gap: { type: 'number' },
            align: { enum: ['start', 'center', 'end', 'stretch', 'spaceBetween', 'spaceAround'] },
          },
        },
      ],
    },
    CardComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component', 'children'],
          properties: {
            component: { const: 'Card' },
            children: { type: 'array', items: { $ref: '#/definitions/Component' } },
            elevated: { type: 'boolean' },
          },
        },
      ],
    },
    TextFieldComponent: {
      allOf: [
        { $ref: '#/definitions/BaseComponent' },
        {
          type: 'object',
          required: ['component', 'valuePath'],
          properties: {
            component: { const: 'TextField' },
            valuePath: { $ref: '#/definitions/JsonPointer' },
            label: { type: 'string' },
            placeholder: { type: 'string' },
            inputType: { enum: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
            required: { type: 'boolean' },
            disabled: { type: 'boolean' },
            multiline: { type: 'boolean' },
            rows: { type: 'number' },
          },
        },
      ],
    },
    Component: {
      oneOf: [
        { $ref: '#/definitions/TextComponent' },
        { $ref: '#/definitions/ButtonComponent' },
        { $ref: '#/definitions/RowComponent' },
        { $ref: '#/definitions/ColumnComponent' },
        { $ref: '#/definitions/CardComponent' },
        { $ref: '#/definitions/TextFieldComponent' },
      ],
    },
  },
} as const;

export const surfaceSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'components'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    components: {
      type: 'array',
      items: { $ref: '#/definitions/Component' },
    },
  },
  definitions: componentSchema.definitions,
} as const;

export const agentMessageSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  oneOf: [
    {
      type: 'object',
      required: ['type', 'surface'],
      properties: {
        type: { const: 'surfaceUpdate' },
        surface: { $ref: '#/definitions/Surface' },
      },
    },
    {
      type: 'object',
      required: ['type', 'path', 'data'],
      properties: {
        type: { const: 'dataModelUpdate' },
        path: { type: 'string' },
        data: {},
      },
    },
    {
      type: 'object',
      required: ['type', 'surfaceId'],
      properties: {
        type: { const: 'deleteSurface' },
        surfaceId: { type: 'string' },
      },
    },
  ],
  definitions: {
    ...componentSchema.definitions,
    Surface: surfaceSchema,
  },
} as const;
