import React from 'react';
import { ProductBatchItem } from '../../common/types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonBatchTable } from '../../common/components/CommonBatchTable';

interface GroceryBatchSectionProps {
  batches: ProductBatchItem[];
  onChangeBatches: (batches: ProductBatchItem[]) => void;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
}

export const GroceryBatchSection: React.FC<GroceryBatchSectionProps> = ({
  batches,
  onChangeBatches,
  basePurchasePrice,
  baseSellingPrice,
  baseMrp,
}) => {
  return (
    <CommonFormCard
      title="Perishable Batches & Expiry (FEFO)"
      subtitle="Track packaged date, best before date, and batch stock for fresh groceries"
      icon="calendar-outline"
    >
      <CommonBatchTable
        batches={batches}
        onChangeBatches={onChangeBatches}
        basePurchasePrice={basePurchasePrice}
        baseSellingPrice={baseSellingPrice}
        baseMrp={baseMrp}
        showRackLocation={true}
      />
    </CommonFormCard>
  );
};

