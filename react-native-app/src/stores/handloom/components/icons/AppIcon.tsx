import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../utils/themeColors';
import {
  DashboardIcon,
  PackageIcon,
  UsersIcon,
  ReceiptIcon,
  CartIcon,
  SettingsIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  AlertTriangleIcon,
  CheckIcon,
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  IndianRupeeIcon,
  BuildingIcon,
  FileTextIcon,
  TrashIcon,
  EditIcon,
  HomeIcon,
  GridIcon,
  BellIcon,
  TruckIcon,
  PhoneIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  ShareIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  StoreIcon,
  ShieldCheckIcon,
  GlobeIcon,
  PieChartIcon,
  ChartColumnIcon,
  TrendingUpIcon,
  WalletIcon,
  CalendarIcon,
  LogOutIcon,
  UserIcon,
  MailIcon,
  MapPinIcon,
  LockIcon,
  DownloadIcon,
} from '../branding/Icons';

export type IconName =
  | 'dashboard'
  | 'Dashboard'
  | 'products'
  | 'Products'
  | 'Package'
  | 'customers'
  | 'Customers'
  | 'Users'
  | 'suppliers'
  | 'Suppliers'
  | 'Truck'
  | 'billing'
  | 'Receipt'
  | 'orders'
  | 'Cart'
  | 'ShoppingBag'
  | 'expenses'
  | 'settings'
  | 'Settings'
  | 'reports'
  | 'analytics'
  | 'pie'
  | 'chart'
  | 'inventory'
  | 'plus'
  | 'Plus'
  | 'search'
  | 'Search'
  | 'filter'
  | 'alert'
  | 'AlertCircle'
  | 'check'
  | 'Check'
  | 'close'
  | 'Close'
  | 'X'
  | 'back'
  | 'next'
  | 'down'
  | 'right'
  | 'ChevronRight'
  | 'ChevronDown'
  | 'rupee'
  | 'building'
  | 'store'
  | 'file'
  | 'trash'
  | 'Trash2'
  | 'edit'
  | 'Edit'
  | 'bell'
  | 'Volume2'
  | 'home'
  | 'Home'
  | 'grid'
  | 'Grid'
  | 'phone'
  | 'Phone'
  | 'CreditCard'
  | 'wallet'
  | 'Share'
  | 'Share2'
  | 'Eye'
  | 'Sun'
  | 'Moon'
  | 'shield'
  | 'globe'
  | 'calendar'
  | 'trending'
  | 'logout'
  | 'user'
  | 'mail'
  | 'mapPin'
  | 'lock'
  | 'download'
  | (string & {});

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Resolves consistent domain colors across the entire Tulsi Mart app:
 * - Home / Dashboard: Orange (#F57C00)
 * - Products / Inventory: Blue (#2196F3)
 * - Customers / Khata: Green (#2EAD64)
 * - Billing / Orders: Purple (#8B5CF6)
 * - Reports / Analytics: Teal (#00897B)
 * - Settings: Grey (#64748B)
 * - Expenses / Delete: Red (#E53935)
 */
export const resolveSemanticIconColor = (name: string): string => {
  const norm = (name || '').toLowerCase();
  switch (norm) {
    case 'dashboard':
    case 'home':
    case 'store':
    case 'suppliers':
    case 'truck':
    case 'building':
      return Colors.iconColors.home;
    case 'products':
    case 'package':
    case 'inventory':
      return Colors.iconColors.products;
    case 'customers':
    case 'users':
    case 'user':
    case 'khata':
    case 'check':
      return Colors.iconColors.customers;
    case 'billing':
    case 'receipt':
    case 'file':
    case 'orders':
    case 'cart':
    case 'shoppingbag':
      return Colors.iconColors.billing;
    case 'reports':
    case 'analytics':
    case 'chart':
    case 'pie':
    case 'trending':
    case 'shield':
      return Colors.iconColors.reports;
    case 'settings':
    case 'globe':
    case 'lock':
      return Colors.iconColors.settings;
    case 'expenses':
    case 'trash':
    case 'trash2':
    case 'logout':
      return Colors.iconColors.expenses;
    case 'alert':
    case 'alertcircle':
      return Colors.warning;
    default:
      return Colors.darkText;
  }
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 22,
  color,
  style,
}) => {
  const norm = (name || '').toLowerCase();
  const resolvedColor = color || resolveSemanticIconColor(norm);

  const renderIcon = () => {
    switch (norm) {
      case 'dashboard':
        return <DashboardIcon size={size} color={resolvedColor} />;
      case 'home':
        return <HomeIcon size={size} color={resolvedColor} />;
      case 'grid':
        return <GridIcon size={size} color={resolvedColor} />;
      case 'products':
      case 'inventory':
      case 'package':
        return <PackageIcon size={size} color={resolvedColor} />;
      case 'customers':
      case 'users':
      case 'khata':
        return <UsersIcon size={size} color={resolvedColor} />;
      case 'user':
        return <UserIcon size={size} color={resolvedColor} />;
      case 'suppliers':
      case 'truck':
        return <TruckIcon size={size} color={resolvedColor} />;
      case 'building':
        return <BuildingIcon size={size} color={resolvedColor} />;
      case 'store':
        return <StoreIcon size={size} color={resolvedColor} />;
      case 'billing':
      case 'receipt':
        return <ReceiptIcon size={size} color={resolvedColor} />;
      case 'orders':
      case 'cart':
        return <CartIcon size={size} color={resolvedColor} />;
      case 'shoppingbag':
        return <ShoppingBagIcon size={size} color={resolvedColor} />;
      case 'creditcard':
        return <CreditCardIcon size={size} color={resolvedColor} />;
      case 'wallet':
        return <WalletIcon size={size} color={resolvedColor} />;
      case 'expenses':
      case 'rupee':
        return <IndianRupeeIcon size={size} color={resolvedColor} />;
      case 'reports':
      case 'chart':
      case 'analytics':
        return <ChartColumnIcon size={size} color={resolvedColor} />;
      case 'pie':
        return <PieChartIcon size={size} color={resolvedColor} />;
      case 'trending':
        return <TrendingUpIcon size={size} color={resolvedColor} />;
      case 'settings':
        return <SettingsIcon size={size} color={resolvedColor} />;
      case 'shield':
        return <ShieldCheckIcon size={size} color={resolvedColor} />;
      case 'globe':
        return <GlobeIcon size={size} color={resolvedColor} />;
      case 'calendar':
        return <CalendarIcon size={size} color={resolvedColor} />;
      case 'logout':
        return <LogOutIcon size={size} color={resolvedColor} />;
      case 'mail':
        return <MailIcon size={size} color={resolvedColor} />;
      case 'mappin':
        return <MapPinIcon size={size} color={resolvedColor} />;
      case 'lock':
        return <LockIcon size={size} color={resolvedColor} />;
      case 'download':
        return <DownloadIcon size={size} color={resolvedColor} />;
      case 'plus':
        return <PlusIcon size={size} color={resolvedColor} />;
      case 'search':
        return <SearchIcon size={size} color={resolvedColor} />;
      case 'filter':
        return <FilterIcon size={size} color={resolvedColor} />;
      case 'alert':
      case 'alertcircle':
        return <AlertTriangleIcon size={size} color={resolvedColor} />;
      case 'check':
        return <CheckIcon size={size} color={resolvedColor} />;
      case 'close':
      case 'x':
        return <CloseIcon size={size} color={resolvedColor} />;
      case 'back':
        return <ArrowLeftIcon size={size} color={resolvedColor} />;
      case 'next':
        return <ArrowRightIcon size={size} color={resolvedColor} />;
      case 'down':
      case 'chevrondown':
        return <ChevronDownIcon size={size} color={resolvedColor} />;
      case 'right':
      case 'chevronright':
        return <ChevronRightIcon size={size} color={resolvedColor} />;
      case 'phone':
        return <PhoneIcon size={size} color={resolvedColor} />;
      case 'share':
      case 'share2':
        return <ShareIcon size={size} color={resolvedColor} />;
      case 'file':
        return <FileTextIcon size={size} color={resolvedColor} />;
      case 'trash':
      case 'trash2':
        return <TrashIcon size={size} color={resolvedColor} />;
      case 'edit':
        return <EditIcon size={size} color={resolvedColor} />;
      case 'bell':
      case 'volume2':
        return <BellIcon size={size} color={resolvedColor} />;
      case 'eye':
        return <EyeIcon size={size} color={resolvedColor} />;
      case 'sun':
        return <SunIcon size={size} color={resolvedColor} />;
      case 'moon':
        return <MoonIcon size={size} color={resolvedColor} />;
      default:
        return <PackageIcon size={size} color={resolvedColor} />;
    }
  };

  return <View style={style}>{renderIcon()}</View>;
};

export default AppIcon;
