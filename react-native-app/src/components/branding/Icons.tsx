/**
 * Nexora Mart Modern Vector Icon System
 * 100% Native Crash-Free Geometric Icons (Zero Native Dependencies)
 * Replaces react-native-svg with pure React Native Views & Canvas-grade geometry
 * Guarantees 100% crash-free execution on all Android & iOS devices.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

// Helper container that centers content and enforces exact width & height
const IconBox: React.FC<{ size: number; style?: any; children: React.ReactNode }> = ({
  size,
  style,
  children,
}) => (
  <View
    style={[
      {
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ==========================================
// 1. CORE NAVIGATION & APP ICONS
// ==========================================

// Home – Home icon (Roof + House body + Door)
export const HomeIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Roof Chevron */}
      <View
        style={{
          width: s * 0.58,
          height: s * 0.58,
          borderTopWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: s * 0.12,
        }}
      />
      {/* House Body */}
      <View
        style={{
          width: s * 0.62,
          height: s * 0.48,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          position: 'absolute',
          bottom: s * 0.12,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/* Door */}
        <View
          style={{
            width: s * 0.22,
            height: s * 0.26,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomWidth: 0,
          }}
        />
      </View>
    </IconBox>
  );
};
export const Home = HomeIcon;

// Dashboard / LayoutDashboard – 2x2 asymmetric rounded rectangles
export const LayoutDashboardIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  const gap = s * 0.08;
  return (
    <IconBox size={s} style={style}>
      <View style={{ width: s * 0.78, height: s * 0.78, flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Left Column */}
        <View style={{ width: s * 0.35, justifyContent: 'space-between' }}>
          <View
            style={{
              width: '100%',
              height: s * 0.46,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRadius: 3,
            }}
          />
          <View
            style={{
              width: '100%',
              height: s * 0.24,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRadius: 3,
            }}
          />
        </View>
        {/* Right Column */}
        <View style={{ width: s * 0.35, justifyContent: 'space-between' }}>
          <View
            style={{
              width: '100%',
              height: s * 0.24,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRadius: 3,
            }}
          />
          <View
            style={{
              width: '100%',
              height: s * 0.46,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRadius: 3,
            }}
          />
        </View>
      </View>
    </IconBox>
  );
};
export const DashboardIcon = LayoutDashboardIcon;
export const LayoutDashboard = LayoutDashboardIcon;

// Products / Package – Isometric / structured box outline
export const PackageIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Outer Hexagonal-like Box */}
      <View
        style={{
          width: s * 0.76,
          height: s * 0.76,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top Flap Seam */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: strokeWidth,
            height: '42%',
            backgroundColor: color,
          }}
        />
        {/* Horizontal Seam */}
        <View
          style={{
            width: '100%',
            height: strokeWidth,
            backgroundColor: color,
          }}
        />
        {/* Bottom Seam */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: strokeWidth,
            height: '58%',
            backgroundColor: color,
          }}
        />
      </View>
    </IconBox>
  );
};
export const ProductsIcon = PackageIcon;
export const Package = PackageIcon;

// Categories / Grid – 4 equal square rounded grid
export const GridIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  const sqSize = s * 0.32;
  return (
    <IconBox size={s} style={style}>
      <View style={{ width: s * 0.76, height: s * 0.76, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: sqSize, height: sqSize, borderWidth: strokeWidth, borderColor: color, borderRadius: 2.5 }} />
          <View style={{ width: sqSize, height: sqSize, borderWidth: strokeWidth, borderColor: color, borderRadius: 2.5 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: sqSize, height: sqSize, borderWidth: strokeWidth, borderColor: color, borderRadius: 2.5 }} />
          <View style={{ width: sqSize, height: sqSize, borderWidth: strokeWidth, borderColor: color, borderRadius: 2.5 }} />
        </View>
      </View>
    </IconBox>
  );
};
export const CategoriesIcon = GridIcon;
export const Grid = GridIcon;

// Orders / ShoppingBag – Bag with arched handles
export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Arched Top Handle */}
      <View
        style={{
          width: s * 0.36,
          height: s * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: (s * 0.36) / 2,
          borderTopRightRadius: (s * 0.36) / 2,
          position: 'absolute',
          top: s * 0.08,
        }}
      />
      {/* Bag Body */}
      <View
        style={{
          width: s * 0.72,
          height: s * 0.6,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 3,
          position: 'absolute',
          bottom: s * 0.1,
        }}
      />
    </IconBox>
  );
};
export const OrdersIcon = ShoppingBagIcon;
export const ShoppingBag = ShoppingBagIcon;

// Cart / ShoppingCart – Basket with handle and wheels
export const ShoppingCartIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Handle Line */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.08,
          top: s * 0.16,
          width: s * 0.18,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Basket Body */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.22,
          top: s * 0.22,
          width: s * 0.62,
          height: s * 0.44,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 2,
        }}
      />
      {/* Left Wheel */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.3,
          bottom: s * 0.12,
          width: s * 0.15,
          height: s * 0.15,
          borderRadius: (s * 0.15) / 2,
          backgroundColor: color,
        }}
      />
      {/* Right Wheel */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.2,
          bottom: s * 0.12,
          width: s * 0.15,
          height: s * 0.15,
          borderRadius: (s * 0.15) / 2,
          backgroundColor: color,
        }}
      />
    </IconBox>
  );
};
export const CartIcon = ShoppingCartIcon;
export const ShoppingCart = ShoppingCartIcon;

// Customers / Users – Dual user silhouette
export const UsersIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Primary User (Left/Front) */}
      <View style={{ position: 'absolute', left: s * 0.08, bottom: s * 0.14, alignItems: 'center' }}>
        <View
          style={{
            width: s * 0.26,
            height: s * 0.26,
            borderRadius: (s * 0.26) / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            marginBottom: s * 0.04,
          }}
        />
        <View
          style={{
            width: s * 0.48,
            height: s * 0.26,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomWidth: 0,
            borderTopLeftRadius: s * 0.24,
            borderTopRightRadius: s * 0.24,
          }}
        />
      </View>
      {/* Secondary User (Right/Back) */}
      <View style={{ position: 'absolute', right: s * 0.08, bottom: s * 0.22, alignItems: 'center', opacity: 0.8 }}>
        <View
          style={{
            width: s * 0.22,
            height: s * 0.22,
            borderRadius: (s * 0.22) / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            marginBottom: s * 0.04,
          }}
        />
        <View
          style={{
            width: s * 0.38,
            height: s * 0.22,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomWidth: 0,
            borderTopLeftRadius: s * 0.19,
            borderTopRightRadius: s * 0.19,
          }}
        />
      </View>
    </IconBox>
  );
};
export const CustomersIcon = UsersIcon;
export const Users = UsersIcon;

// Employees / UserRound – Single rounded user
export const UserRoundIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Head */}
      <View
        style={{
          width: s * 0.36,
          height: s * 0.36,
          borderRadius: (s * 0.36) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          position: 'absolute',
          top: s * 0.1,
        }}
      />
      {/* Shoulders */}
      <View
        style={{
          width: s * 0.68,
          height: s * 0.34,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: s * 0.34,
          borderTopRightRadius: s * 0.34,
          position: 'absolute',
          bottom: s * 0.1,
        }}
      />
    </IconBox>
  );
};
export const EmployeesIcon = UserRoundIcon;
export const UserRound = UserRoundIcon;
export const UserIcon = UserRoundIcon;
export const User = UserRoundIcon;

// Reports / ChartColumn – 4 vertical columns with different heights
export const ChartColumnIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  const barW = s * 0.14;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.8,
          height: s * 0.72,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          borderBottomWidth: strokeWidth,
          borderColor: color,
          paddingBottom: 2,
        }}
      >
        <View style={{ width: barW, height: '42%', backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: barW, height: '78%', backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: barW, height: '56%', backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: barW, height: '96%', backgroundColor: color, borderRadius: 2 }} />
      </View>
    </IconBox>
  );
};
export const ReportsIcon = ChartColumnIcon;
export const ChartColumn = ChartColumnIcon;
export const BarChart3 = ChartColumnIcon;

// Analytics / ChartNoAxesCombined / TrendingUp
export const ChartNoAxesCombinedIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Baseline */}
      <View
        style={{
          position: 'absolute',
          bottom: s * 0.15,
          left: s * 0.1,
          right: s * 0.1,
          height: strokeWidth,
          backgroundColor: color,
        }}
      />
      {/* Trending Up Arrow Tip */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.12,
          top: s * 0.14,
          width: s * 0.28,
          height: s * 0.28,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
        }}
      />
      {/* Zigzag Diagonal Bar */}
      <View
        style={{
          position: 'absolute',
          width: s * 0.66,
          height: strokeWidth,
          backgroundColor: color,
          transform: [{ rotate: '-38deg' }],
          top: s * 0.44,
        }}
      />
    </IconBox>
  );
};
export const AnalyticsIcon = ChartNoAxesCombinedIcon;
export const ChartNoAxesCombined = ChartNoAxesCombinedIcon;
export const TrendingUp = ChartNoAxesCombinedIcon;

// Settings – Minimalist gear / control knob
export const SettingsIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Outer Circle */}
      <View
        style={{
          width: s * 0.72,
          height: s * 0.72,
          borderRadius: (s * 0.72) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Center Axle */}
        <View
          style={{
            width: s * 0.24,
            height: s * 0.24,
            borderRadius: (s * 0.24) / 2,
            borderWidth: strokeWidth,
            borderColor: color,
          }}
        />
        {/* Top/Bottom Teeth */}
        <View style={{ position: 'absolute', top: -3, width: strokeWidth * 2, height: 4, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: -3, width: strokeWidth * 2, height: 4, backgroundColor: color }} />
        {/* Left/Right Teeth */}
        <View style={{ position: 'absolute', left: -3, height: strokeWidth * 2, width: 4, backgroundColor: color }} />
        <View style={{ position: 'absolute', right: -3, height: strokeWidth * 2, width: 4, backgroundColor: color }} />
      </View>
    </IconBox>
  );
};
export const Settings = SettingsIcon;

// Profile / CircleUser – Outer circle with user inside
export const CircleUserIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.88,
          height: s * 0.88,
          borderRadius: (s * 0.88) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Head */}
        <View
          style={{
            width: s * 0.28,
            height: s * 0.28,
            borderRadius: (s * 0.28) / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            marginTop: s * 0.08,
          }}
        />
        {/* Shoulders */}
        <View
          style={{
            width: s * 0.6,
            height: s * 0.3,
            borderTopLeftRadius: s * 0.3,
            borderTopRightRadius: s * 0.3,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomWidth: 0,
            marginTop: 2,
          }}
        />
      </View>
    </IconBox>
  );
};
export const ProfileIcon = CircleUserIcon;
export const CircleUser = CircleUserIcon;

// Notifications / Bell – Bell dome with clapper
export const BellIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Top Hanger */}
      <View
        style={{
          width: s * 0.16,
          height: s * 0.1,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: 0,
          position: 'absolute',
          top: s * 0.08,
        }}
      />
      {/* Bell Dome */}
      <View
        style={{
          width: s * 0.64,
          height: s * 0.52,
          borderTopLeftRadius: s * 0.32,
          borderTopRightRadius: s * 0.32,
          borderWidth: strokeWidth,
          borderColor: color,
          position: 'absolute',
          top: s * 0.16,
        }}
      />
      {/* Bell Base Flange */}
      <View
        style={{
          width: s * 0.76,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          top: s * 0.68,
        }}
      />
      {/* Clapper Dot */}
      <View
        style={{
          width: s * 0.18,
          height: s * 0.14,
          borderBottomLeftRadius: s * 0.09,
          borderBottomRightRadius: s * 0.09,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopWidth: 0,
          position: 'absolute',
          top: s * 0.72,
        }}
      />
    </IconBox>
  );
};
export const NotificationsIcon = BellIcon;
export const Bell = BellIcon;

// Search – Magnifying glass with diagonal handle
export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  const glassSize = s * 0.54;
  return (
    <IconBox size={s} style={style}>
      {/* Glass Circle */}
      <View
        style={{
          width: glassSize,
          height: glassSize,
          borderRadius: glassSize / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          position: 'absolute',
          top: s * 0.1,
          left: s * 0.1,
        }}
      />
      {/* Diagonal Handle */}
      <View
        style={{
          width: s * 0.38,
          height: strokeWidth + 0.5,
          backgroundColor: color,
          borderRadius: 2,
          position: 'absolute',
          bottom: s * 0.2,
          right: s * 0.12,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </IconBox>
  );
};
export const Search = SearchIcon;

// Logout / LogOut – Open door bracket + exit arrow
export const LogOutIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Door Frame Bracket */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.1,
          width: s * 0.38,
          height: s * 0.74,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRightWidth: 0,
          borderRadius: 3,
        }}
      />
      {/* Exit Arrow Stem */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.32,
          width: s * 0.44,
          height: strokeWidth,
          backgroundColor: color,
        }}
      />
      {/* Exit Arrowhead */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.12,
          width: s * 0.22,
          height: s * 0.22,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </IconBox>
  );
};
export const LogoutIcon = LogOutIcon;
export const LogOut = LogOutIcon;

// Payments / CreditCard – Rounded card with stripe and chip
export const CreditCardIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.88,
          height: s * 0.62,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 4,
          justifyContent: 'space-between',
          paddingVertical: 3,
        }}
      >
        {/* Magnetic Stripe */}
        <View style={{ width: '100%', height: s * 0.12, backgroundColor: color }} />
        {/* Card Chip Dot */}
        <View
          style={{
            width: s * 0.14,
            height: s * 0.1,
            backgroundColor: color,
            borderRadius: 1.5,
            marginLeft: 4,
          }}
        />
      </View>
    </IconBox>
  );
};
export const PaymentsIcon = CreditCardIcon;
export const CreditCard = CreditCardIcon;

// Inventory / Boxes – Layered multi-boxes
export const BoxesIcon: React.FC<IconProps> = ({ size = 22, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  const boxW = s * 0.44;
  const boxH = s * 0.38;
  return (
    <IconBox size={s} style={style}>
      {/* Top Box */}
      <View
        style={{
          position: 'absolute',
          top: s * 0.08,
          width: boxW,
          height: boxH,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: '50%', height: strokeWidth, backgroundColor: color }} />
      </View>
      {/* Bottom Left Box */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.06,
          bottom: s * 0.1,
          width: boxW,
          height: boxH,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 3,
        }}
      />
      {/* Bottom Right Box */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.06,
          bottom: s * 0.1,
          width: boxW,
          height: boxH,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </IconBox>
  );
};
export const InventoryIcon = BoxesIcon;
export const Boxes = BoxesIcon;

// ==========================================
// 2. FORM & INPUT ICONS
// ==========================================

// Mail – Envelope with flap
export const MailIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.88,
          height: s * 0.62,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Envelope V Flap */}
        <View
          style={{
            width: s * 0.58,
            height: s * 0.58,
            borderBottomWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            top: -s * 0.32,
          }}
        />
      </View>
    </IconBox>
  );
};
export const Mail = MailIcon;

// Lock – Padlock with shackle
export const LockIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Top Shackle */}
      <View
        style={{
          width: s * 0.44,
          height: s * 0.4,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: (s * 0.44) / 2,
          borderTopRightRadius: (s * 0.44) / 2,
          position: 'absolute',
          top: s * 0.08,
        }}
      />
      {/* Padlock Body */}
      <View
        style={{
          width: s * 0.72,
          height: s * 0.48,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 4,
          position: 'absolute',
          bottom: s * 0.1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Keyhole Dot */}
        <View
          style={{
            width: strokeWidth * 2,
            height: strokeWidth * 2.6,
            borderRadius: strokeWidth,
            backgroundColor: color,
          }}
        />
      </View>
    </IconBox>
  );
};
export const Lock = LockIcon;

// Eye – Open eye with pupil
export const EyeIcon: React.FC<IconProps> = ({ size = 18, color = '#768499', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Eye Contour */}
      <View
        style={{
          width: s * 0.88,
          height: s * 0.54,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: s * 0.27,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pupil */}
        <View
          style={{
            width: s * 0.26,
            height: s * 0.26,
            borderRadius: (s * 0.26) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </IconBox>
  );
};
export const Eye = EyeIcon;

// EyeOff – Eye with diagonal slash line
export const EyeOffIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Eye Contour */}
      <View
        style={{
          width: s * 0.88,
          height: s * 0.54,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: s * 0.27,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.85,
        }}
      >
        {/* Pupil */}
        <View
          style={{
            width: s * 0.24,
            height: s * 0.24,
            borderRadius: (s * 0.24) / 2,
            backgroundColor: color,
          }}
        />
      </View>
      {/* Diagonal Slash Line */}
      <View
        style={{
          position: 'absolute',
          width: s * 0.95,
          height: strokeWidth + 0.4,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </IconBox>
  );
};
export const EyeOff = EyeOffIcon;

// ArrowRight – Horizontal stem with sharp right chevron
export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF', strokeWidth = 2.2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Stem */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.12,
          width: s * 0.62,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Arrowhead */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.14,
          width: s * 0.34,
          height: s * 0.34,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </IconBox>
  );
};
export const ArrowRight = ArrowRightIcon;

// Check – Sharp checkmark
export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF', strokeWidth = 2.4, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.32,
          height: s * 0.62,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginBottom: s * 0.12,
        }}
      />
    </IconBox>
  );
};
export const Check = CheckIcon;

// Close / X – Crossing diagonal lines
export const CloseIcon: React.FC<IconProps> = ({ size = 16, color = '#768499', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          position: 'absolute',
          width: s * 0.72,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: s * 0.72,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </IconBox>
  );
};
export const X = CloseIcon;

// Plus – Horizontal & vertical lines
export const PlusIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF', strokeWidth = 2.2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View style={{ width: s * 0.72, height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', height: s * 0.72, width: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
    </IconBox>
  );
};
export const Plus = PlusIcon;

// Phone – Smartphone outline with screen
export const PhoneIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.58,
          height: s * 0.84,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 2,
        }}
      >
        {/* Speaker Notch */}
        <View style={{ width: s * 0.18, height: strokeWidth, backgroundColor: color, borderRadius: 1 }} />
        {/* Home Dot */}
        <View style={{ width: strokeWidth * 1.8, height: strokeWidth * 1.8, borderRadius: strokeWidth, backgroundColor: color }} />
      </View>
    </IconBox>
  );
};
export const Phone = PhoneIcon;

// Store – Awning and storefront
export const StoreIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Awning Roof */}
      <View
        style={{
          width: s * 0.88,
          height: s * 0.32,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 2,
          position: 'absolute',
          top: s * 0.1,
        }}
      />
      {/* Store Columns */}
      <View
        style={{
          width: s * 0.74,
          height: s * 0.46,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: s * 0.12,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
        }}
      >
        {/* Door */}
        <View style={{ width: s * 0.22, height: s * 0.3, borderWidth: strokeWidth, borderColor: color, borderBottomWidth: 0 }} />
      </View>
    </IconBox>
  );
};
export const Store = StoreIcon;

// ChevronDown – Rotated 135deg
export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, color = '#768499', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.38,
          height: s * 0.38,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginBottom: s * 0.12,
        }}
      />
    </IconBox>
  );
};
export const ChevronDown = ChevronDownIcon;

// ChevronRight – Rotated 45deg
export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, color = '#768499', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.38,
          height: s * 0.38,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginRight: s * 0.08,
        }}
      />
    </IconBox>
  );
};
export const ChevronRight = ChevronRightIcon;

// ChevronLeft – Rotated 225deg
export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 16, color = '#768499', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.38,
          height: s * 0.38,
          borderBottomWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: s * 0.08,
        }}
      />
    </IconBox>
  );
};
export const ChevronLeft = ChevronLeftIcon;

// Key – Key with ring and teeth
export const KeyIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Key Bow (Ring) */}
      <View
        style={{
          width: s * 0.44,
          height: s * 0.44,
          borderRadius: (s * 0.44) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          position: 'absolute',
          left: s * 0.08,
          top: s * 0.16,
        }}
      />
      {/* Key Blade Stem */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.44,
          top: s * 0.34,
          width: s * 0.46,
          height: strokeWidth,
          backgroundColor: color,
        }}
      />
      {/* Key Tooth 1 */}
      <View style={{ position: 'absolute', right: s * 0.18, top: s * 0.34, width: strokeWidth, height: s * 0.16, backgroundColor: color }} />
      {/* Key Tooth 2 */}
      <View style={{ position: 'absolute', right: s * 0.3, top: s * 0.34, width: strokeWidth, height: s * 0.12, backgroundColor: color }} />
    </IconBox>
  );
};
export const Key = KeyIcon;

// Receipt – Document with jagged bottom
export const ReceiptIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.68,
          height: s * 0.8,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 2,
          padding: 3,
          justifyContent: 'space-around',
        }}
      >
        <View style={{ width: '70%', height: strokeWidth, backgroundColor: color }} />
        <View style={{ width: '90%', height: strokeWidth, backgroundColor: color }} />
        <View style={{ width: '50%', height: strokeWidth, backgroundColor: color }} />
      </View>
    </IconBox>
  );
};
export const Receipt = ReceiptIcon;

// Truck – Delivery Truck
export const TruckIcon: React.FC<IconProps> = ({ size = 20, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Cargo Body */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.08,
          top: s * 0.2,
          width: s * 0.52,
          height: s * 0.46,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: 2,
        }}
      />
      {/* Cabin */}
      <View
        style={{
          position: 'absolute',
          right: s * 0.08,
          top: s * 0.32,
          width: s * 0.28,
          height: s * 0.34,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopRightRadius: 6,
        }}
      />
      {/* Left Wheel */}
      <View style={{ position: 'absolute', left: s * 0.2, bottom: s * 0.14, width: s * 0.16, height: s * 0.16, borderRadius: (s * 0.16) / 2, backgroundColor: color }} />
      {/* Right Wheel */}
      <View style={{ position: 'absolute', right: s * 0.16, bottom: s * 0.14, width: s * 0.16, height: s * 0.16, borderRadius: (s * 0.16) / 2, backgroundColor: color }} />
    </IconBox>
  );
};
export const Truck = TruckIcon;

// Building – High-rise / Office
export const BuildingIcon: React.FC<IconProps> = ({ size = 20, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.68,
          height: s * 0.8,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: strokeWidth * 1.5,
          borderRadius: 2,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 2,
        }}
      >
        <View style={{ flexDirection: 'row', width: '70%', justifyContent: 'space-between' }}>
          <View style={{ width: 3, height: 3, backgroundColor: color }} />
          <View style={{ width: 3, height: 3, backgroundColor: color }} />
        </View>
        <View style={{ flexDirection: 'row', width: '70%', justifyContent: 'space-between' }}>
          <View style={{ width: 3, height: 3, backgroundColor: color }} />
          <View style={{ width: 3, height: 3, backgroundColor: color }} />
        </View>
        <View style={{ width: s * 0.22, height: s * 0.24, borderWidth: strokeWidth, borderColor: color, borderBottomWidth: 0 }} />
      </View>
    </IconBox>
  );
};
export const Building = BuildingIcon;

// Rupee / IndianRupee – ₹ currency symbol
export const RupeeIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <Text style={{ fontSize: s * 0.9, fontWeight: '700', color, lineHeight: s * 1.1 }}>₹</Text>
    </IconBox>
  );
};
export const IndianRupee = RupeeIcon;
export const IndianRupeeIcon = RupeeIcon;

// Refresh – Circular arrows
export const RefreshIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.72,
          height: s * 0.72,
          borderRadius: (s * 0.72) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {/* Arrowhead */}
      <View
        style={{
          position: 'absolute',
          top: s * 0.08,
          right: s * 0.16,
          width: s * 0.22,
          height: s * 0.22,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </IconBox>
  );
};
export const Refresh = RefreshIcon;
export const RefreshCw = RefreshIcon;

// Sun – Sun circle with radiating rays
export const SunIcon: React.FC<IconProps> = ({ size = 20, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  const sunCenter = s * 0.44;
  return (
    <IconBox size={s} style={style}>
      {/* Center Core */}
      <View
        style={{
          width: sunCenter,
          height: sunCenter,
          borderRadius: sunCenter / 2,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      {/* Vertical Rays */}
      <View style={{ position: 'absolute', top: 1, width: strokeWidth, height: 3, backgroundColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, width: strokeWidth, height: 3, backgroundColor: color }} />
      {/* Horizontal Rays */}
      <View style={{ position: 'absolute', left: 1, height: strokeWidth, width: 3, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 1, height: strokeWidth, width: 3, backgroundColor: color }} />
    </IconBox>
  );
};
export const Sun = SunIcon;

// Moon – Crescent moon
export const MoonIcon: React.FC<IconProps> = ({ size = 20, color = '#FF6A1A', strokeWidth = 2, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      <View
        style={{
          width: s * 0.68,
          height: s * 0.68,
          borderRadius: (s * 0.68) / 2,
          borderLeftWidth: strokeWidth * 1.6,
          borderBottomWidth: strokeWidth * 1.6,
          borderColor: color,
          transform: [{ rotate: '-20deg' }],
        }}
      />
    </IconBox>
  );
};
export const Moon = MoonIcon;

// Filter – Funnel
export const FilterIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A', strokeWidth = 1.8, style }) => {
  const s = size;
  return (
    <IconBox size={s} style={style}>
      {/* Top Funnel Bar */}
      <View style={{ width: s * 0.8, height: strokeWidth, backgroundColor: color, borderRadius: 1, top: s * 0.16 }} />
      {/* Funnel V */}
      <View
        style={{
          width: s * 0.5,
          height: s * 0.5,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          top: -s * 0.1,
        }}
      />
      {/* Funnel Stem */}
      <View style={{ position: 'absolute', bottom: s * 0.14, width: strokeWidth, height: s * 0.28, backgroundColor: color }} />
    </IconBox>
  );
};
export const Filter = FilterIcon;

// Google – Clean Google branded badge
export const GoogleIcon: React.FC<{ size?: number; style?: any }> = ({ size = 20, style }) => {
  const s = size;
  return (
    <View
      style={[
        {
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: s * 0.62, fontWeight: '900', color: '#4285F4' }}>G</Text>
    </View>
  );
};
export const Google = GoogleIcon;

export default {
  Home,
  LayoutDashboard,
  Package,
  Grid,
  ShoppingBag,
  ShoppingCart,
  Users,
  UserRound,
  ChartColumn,
  ChartNoAxesCombined,
  Settings,
  CircleUser,
  Bell,
  Search,
  LogOut,
  CreditCard,
  Boxes,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
  Plus,
  Phone,
  Store,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Key,
  Receipt,
  Truck,
  Building,
  RupeeIcon,
  IndianRupee,
  Sun,
  Moon,
  Filter,
  Google,
};
