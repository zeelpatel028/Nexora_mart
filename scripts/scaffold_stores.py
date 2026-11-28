import os
from pathlib import Path

store_types = {
    'grocery': 'Grocery Store',
    'clothing': 'Clothing & Garments',
    'medical': 'Medical & Pharmacy',
    'electronics': 'Mobile & Electronics',
    'plastic': 'Plastic & Household',
    'handloom': 'Handloom & Textiles',
    'furniture': 'Furniture & Woodwork',
    'agro': 'Agro & Seed Store'
}

base_dir = Path('react-native-app/src/stores')
base_dir.mkdir(parents=True, exist_ok=True)

for st_key, st_name in store_types.items():
    st_dir = base_dir / st_key
    subfolders = [
        f'{st_key}_dashboard',
        f'{st_key}_products',
        f'{st_key}_inventory',
        f'{st_key}_orders',
        f'{st_key}_billing'
    ]
    for sub in subfolders:
        s_path = st_dir / sub
        s_path.mkdir(parents=True, exist_ok=True)
        sub_name = sub.split('_')[-1].title()
        
        # Types
        types_content = f'''export interface {st_key.title()}{sub_name}Data {{
  id: string | number;
  name?: string;
  storeType: "{st_key}";
}}
'''
        (s_path / 'types.ts').write_text(types_content, encoding='utf-8')

        # Styles
        styles_content = f'''import {{ StyleSheet }} from 'react-native';
import {{ Colors }} from '../../../theme/colors';

export const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  }},
  title: {{
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: 8,
  }},
}});
'''
        (s_path / 'styles.ts').write_text(styles_content, encoding='utf-8')

        # Service
        service_content = f'''import apiClient from '../../../services/api/apiClient';

export const {st_key}{sub_name}Service = {{
  getData: async () => {{
    return apiClient.get('/products');
  }},
}};
'''
        (s_path / 'service.ts').write_text(service_content, encoding='utf-8')

        # Screen
        screen_name = f'{st_key.title()}{sub_name}Screen'
        screen_content = f'''import React from 'react';
import {{ View, Text }} from 'react-native';
import {{ styles }} from './styles';
import AppHeader from '../../../components/layout/AppHeader';

export const {screen_name}: React.FC = () => {{
  return (
    <View style={{styles.container}}>
      <AppHeader title="{st_name} {sub_name}" />
      <Text style={{styles.title}}>{st_name} {sub_name}</Text>
    </View>
  );
}};

export default {screen_name};
'''
        (s_path / f'{screen_name}.tsx').write_text(screen_content, encoding='utf-8')

    # Store index
    index_content = f'''export * from './{st_key}_dashboard/{st_key.title()}DashboardScreen';
export * from './{st_key}_products/{st_key.title()}ProductsScreen';
export * from './{st_key}_inventory/{st_key.title()}InventoryScreen';
export * from './{st_key}_orders/{st_key.title()}OrdersScreen';
export * from './{st_key}_billing/{st_key.title()}BillingScreen';
'''
    (st_dir / 'index.ts').write_text(index_content, encoding='utf-8')

print('All 8 store-wise frontend modules generated successfully.')
