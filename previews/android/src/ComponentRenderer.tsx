import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as Icons from '@mui/icons-material';
import type { Component, DataModel, Action } from '@claude-canvas/core';

interface ComponentRendererProps {
  component: Component;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
  onAction: (action: Action) => void;
}

const getByPointer = (obj: DataModel, path: string): unknown => {
  const parts = path.split('/').filter(p => p);
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
};

const mapIcon = (name: string): React.ReactElement => {
  const iconMap: Record<string, keyof typeof Icons> = {
    add: 'Add',
    plus: 'Add',
    remove: 'Remove',
    minus: 'Remove',
    close: 'Close',
    x: 'Close',
    check: 'Check',
    edit: 'Edit',
    delete: 'Delete',
    trash: 'Delete',
    search: 'Search',
    settings: 'Settings',
    home: 'Home',
    user: 'Person',
    person: 'Person',
    mail: 'Mail',
    email: 'Email',
    phone: 'Phone',
    star: 'Star',
    heart: 'Favorite',
    favorite: 'Favorite',
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
    success: 'CheckCircle',
    check_circle: 'CheckCircle',
    arrow_left: 'ChevronLeft',
    chevron_left: 'ChevronLeft',
    arrow_right: 'ChevronRight',
    chevron_right: 'ChevronRight',
    arrow_up: 'ArrowUpward',
    arrow_down: 'ArrowDownward',
    menu: 'Menu',
    more: 'MoreVert',
    more_vert: 'MoreVert',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    copy: 'ContentCopy',
    paste: 'ContentPaste',
    refresh: 'Refresh',
    sync: 'Sync',
    calendar: 'CalendarToday',
    clock: 'AccessTime',
    time: 'AccessTime',
    location: 'LocationOn',
    map: 'Map',
    link: 'Link',
    image: 'Image',
    photo: 'Photo',
    video: 'Videocam',
    music: 'MusicNote',
    audio: 'MusicNote',
    file: 'InsertDriveFile',
    document: 'Description',
    folder: 'Folder',
    expand_more: 'ExpandMore',
  };

  const iconName = iconMap[name.toLowerCase()] || 'HelpOutline';
  const IconComponent = (Icons as Record<string, React.ElementType>)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.HelpOutline />;
};

export function ComponentRenderer({ component, dataModel, onInput, onAction }: ComponentRendererProps) {
  const renderChildren = (children: Component[]) => {
    return children.map((child, index) => (
      <ComponentRenderer
        key={(child as { id?: string }).id || index}
        component={child}
        dataModel={dataModel}
        onInput={onInput}
        onAction={onAction}
      />
    ));
  };

  switch (component.component) {
    case 'Row': {
      const { children, gap = 0, align, justify, wrap } = component as {
        children: Component[];
        gap?: number;
        align?: string;
        justify?: string;
        wrap?: boolean;
      };
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: wrap ? 'wrap' : 'nowrap',
            gap: `${gap}px`,
            alignItems: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start',
            justifyContent:
              justify === 'center' ? 'center' :
              justify === 'end' ? 'flex-end' :
              justify === 'spaceBetween' ? 'space-between' :
              justify === 'spaceAround' ? 'space-around' : 'flex-start',
          }}
        >
          {renderChildren(children)}
        </Box>
      );
    }

    case 'Column': {
      const { children, gap = 0, align } = component as {
        children: Component[];
        gap?: number;
        align?: string;
      };
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`,
            alignItems: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'stretch',
          }}
        >
          {renderChildren(children)}
        </Box>
      );
    }

    case 'Card': {
      const { children, elevated = true } = component as { children: Component[]; elevated?: boolean };
      return (
        <Card
          elevation={elevated ? 1 : 0}
          sx={{
            borderRadius: 3,
            mb: 2,
          }}
        >
          <CardContent>{renderChildren(children)}</CardContent>
        </Card>
      );
    }

    case 'Text': {
      const { content, contentPath, textStyle, color } = component as {
        content?: string;
        contentPath?: string;
        textStyle?: string;
        color?: string;
      };
      const text = contentPath ? String(getByPointer(dataModel, contentPath) ?? '') : content ?? '';
      const variant =
        textStyle === 'heading1' ? 'h4' :
        textStyle === 'heading2' ? 'h5' :
        textStyle === 'heading3' ? 'h6' :
        textStyle === 'caption' ? 'caption' :
        textStyle === 'code' ? 'body2' : 'body1';

      return (
        <Typography
          variant={variant}
          sx={{
            color,
            fontFamily: textStyle === 'code' ? 'monospace' : undefined,
          }}
        >
          {text}
        </Typography>
      );
    }

    case 'TextField': {
      const { valuePath, label, placeholder, disabled, multiline, rows } = component as {
        valuePath: string;
        label?: string;
        placeholder?: string;
        disabled?: boolean;
        multiline?: boolean;
        rows?: number;
      };
      const value = valuePath ? String(getByPointer(dataModel, valuePath) ?? '') : '';
      return (
        <TextField
          fullWidth
          variant="outlined"
          label={label}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          onChange={(e) => onInput(valuePath, e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
      );
    }

    case 'Button': {
      const { label, variant = 'primary', disabled, loading, action, icon } = component as {
        label: string;
        variant?: string;
        disabled?: boolean;
        loading?: boolean;
        action: Action;
        icon?: string;
      };
      const buttonVariant =
        variant === 'secondary' ? 'outlined' :
        variant === 'outline' ? 'outlined' :
        variant === 'ghost' ? 'text' :
        variant === 'danger' ? 'contained' : 'contained';
      const buttonColor = variant === 'danger' ? 'error' : 'primary';

      return (
        <Button
          variant={buttonVariant}
          color={buttonColor}
          disabled={disabled || loading}
          onClick={() => onAction(action)}
          startIcon={icon ? mapIcon(icon) : undefined}
          sx={{
            borderRadius: 5,
            textTransform: 'none',
            px: 3,
            py: 1.25,
          }}
        >
          {loading ? <CircularProgress size={20} /> : label}
        </Button>
      );
    }

    case 'Checkbox': {
      const { valuePath, label, disabled } = component as {
        valuePath: string;
        label?: string;
        disabled?: boolean;
      };
      const checked = Boolean(getByPointer(dataModel, valuePath));
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={(e) => onInput(valuePath, e.target.checked)}
            />
          }
          label={label}
        />
      );
    }

    case 'Slider': {
      const { valuePath, label, min = 0, max = 100, step, disabled, showValue = true } = component as {
        valuePath: string;
        label?: string;
        min?: number;
        max?: number;
        step?: number;
        disabled?: boolean;
        showValue?: boolean;
      };
      const value = Number(getByPointer(dataModel, valuePath) ?? min);
      return (
        <Box sx={{ mb: 2 }}>
          {label && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{label}</Typography>
              {showValue && <Typography variant="body2">{value}</Typography>}
            </Box>
          )}
          <Slider
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(_, v) => onInput(valuePath, v)}
          />
        </Box>
      );
    }

    case 'Select': {
      const { valuePath, label, placeholder, options, disabled } = component as {
        valuePath: string;
        label?: string;
        placeholder?: string;
        options: { label: string; value: string }[];
        disabled?: boolean;
      };
      const value = String(getByPointer(dataModel, valuePath) ?? '');
      return (
        <FormControl fullWidth sx={{ mb: 2 }}>
          {label && <InputLabel>{label}</InputLabel>}
          <Select
            value={value}
            label={label}
            disabled={disabled}
            onChange={(e) => onInput(valuePath, e.target.value)}
            displayEmpty
            sx={{ borderRadius: 1 }}
          >
            {placeholder && <MenuItem value="" disabled>{placeholder}</MenuItem>}
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    case 'Image': {
      const { src, srcPath, alt, fit } = component as {
        src?: string;
        srcPath?: string;
        alt?: string;
        fit?: string;
      };
      const imageSrc = src || (srcPath ? String(getByPointer(dataModel, srcPath) ?? '') : '');
      return (
        <Box
          component="img"
          src={imageSrc}
          alt={alt}
          sx={{
            maxWidth: '100%',
            objectFit: fit as 'cover' | 'contain' | 'fill' || 'cover',
            borderRadius: 2,
          }}
        />
      );
    }

    case 'Icon': {
      const { name, size = 24, color } = component as { name: string; size?: number; color?: string };
      const IconComponent = mapIcon(name);
      return React.cloneElement(IconComponent, { sx: { fontSize: size, color } });
    }

    case 'Divider': {
      const { vertical } = component as { vertical?: boolean };
      return <Divider orientation={vertical ? 'vertical' : 'horizontal'} sx={{ my: 2 }} />;
    }

    case 'Progress': {
      const { value, valuePath, variant = 'linear', color, showLabel } = component as {
        value?: number;
        valuePath?: string;
        variant?: string;
        color?: string;
        showLabel?: boolean;
      };
      const progress = value ?? (valuePath ? Number(getByPointer(dataModel, valuePath) ?? 0) : undefined);

      if (variant === 'circular') {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress
              variant={progress !== undefined ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{ color }}
            />
            {showLabel && progress !== undefined && (
              <Typography variant="body2">{progress}%</Typography>
            )}
          </Box>
        );
      }

      return (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.1)', '& .MuiLinearProgress-bar': { bgcolor: color } }}
          />
          {showLabel && progress !== undefined && (
            <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>{progress}%</Typography>
          )}
        </Box>
      );
    }

    case 'Badge': {
      const { content, contentPath, variant = 'default', pill } = component as {
        content?: string;
        contentPath?: string;
        variant?: string;
        pill?: boolean;
      };
      const text = content || (contentPath ? String(getByPointer(dataModel, contentPath) ?? '') : '');
      const colorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
        default: 'default',
        success: 'success',
        warning: 'warning',
        error: 'error',
        info: 'info',
      };
      return (
        <Chip
          label={text}
          color={colorMap[variant] || 'default'}
          size="small"
          sx={{ borderRadius: pill ? 5 : 1 }}
        />
      );
    }

    case 'Avatar': {
      const { src, srcPath, initials, size = 'medium' } = component as {
        src?: string;
        srcPath?: string;
        initials?: string;
        size?: string | number;
      };
      const imageSrc = src || (srcPath ? String(getByPointer(dataModel, srcPath) ?? '') : '');
      const sizeValue = typeof size === 'number' ? size : size === 'small' ? 32 : size === 'large' ? 56 : 40;
      return (
        <Avatar
          src={imageSrc}
          sx={{ width: sizeValue, height: sizeValue }}
        >
          {initials}
        </Avatar>
      );
    }

    case 'Alert': {
      const { title, message, variant = 'info', showIcon = true } = component as {
        title?: string;
        message: string;
        variant?: string;
        showIcon?: boolean;
      };
      const severityMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'error',
      };
      return (
        <Alert
          severity={severityMap[variant] || 'info'}
          icon={showIcon ? undefined : false}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </Alert>
      );
    }

    case 'Tabs': {
      const { valuePath, tabs } = component as {
        valuePath: string;
        tabs: { label: string; value: string; children: Component[] }[];
      };
      const currentValue = String(getByPointer(dataModel, valuePath) ?? tabs[0]?.value ?? '');
      const activeTab = tabs.find(t => t.value === currentValue) || tabs[0];

      return (
        <Box>
          <Tabs
            value={currentValue}
            onChange={(_, v) => onInput(valuePath, v)}
            sx={{ mb: 2 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          {activeTab && renderChildren(activeTab.children)}
        </Box>
      );
    }

    case 'Accordion': {
      const { items } = component as {
        items: { id: string; title: string; children: Component[] }[];
      };
      return (
        <Box>
          {items.map((item) => (
            <Accordion key={item.id} sx={{ borderRadius: 2, mb: 1, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{item.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderChildren(item.children)}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    }

    case 'Link': {
      const { label, href } = component as { label: string; href?: string };
      return (
        <Link href={href} underline="hover" sx={{ color: 'primary.main' }}>
          {label}
        </Link>
      );
    }

    case 'Skeleton': {
      const { variant = 'text', width, height } = component as {
        variant?: string;
        width?: number | string;
        height?: number | string;
      };
      return (
        <Skeleton
          variant={variant === 'circular' ? 'circular' : variant === 'rectangular' ? 'rectangular' : 'text'}
          width={width}
          height={height}
          sx={{ borderRadius: 1 }}
        />
      );
    }

    case 'List': {
      const { itemsPath, itemTemplate, emptyMessage, gap = 0 } = component as {
        itemsPath: string;
        itemTemplate: Component;
        emptyMessage?: string;
        gap?: number;
      };
      const items = getByPointer(dataModel, itemsPath) as unknown[];

      if (!Array.isArray(items) || items.length === 0) {
        return <Typography color="text.secondary">{emptyMessage || 'No items'}</Typography>;
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
          {items.map((item, index) => {
            const scopedDataModel = { ...dataModel, item, index };
            return (
              <ComponentRenderer
                key={index}
                component={itemTemplate}
                dataModel={scopedDataModel}
                onInput={onInput}
                onAction={onAction}
              />
            );
          })}
        </Box>
      );
    }

    default:
      return (
        <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2">
            Unknown component: {(component as { component: string }).component}
          </Typography>
        </Box>
      );
  }
}
