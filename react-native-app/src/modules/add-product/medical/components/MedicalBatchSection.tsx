import React from 'react';
import { ProductBatchItem } from '../../common/types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonBatchTable } from '../../common/components/CommonBatchTable';

interface MedicalBatchSectionProps {
  batches: ProductBatchItem[];
  onChangeBatches: (batches: ProductBatchItem[]) => void;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
}

export const MedicalBatchSection: React.FC<MedicalBatchSectionProps> = ({
  batches,
  onChangeBatches,
  basePurchasePrice,
  baseSellingPrice,
  baseMrp,
}) => {
  return (
    <CommonFormCard
      title="Medicine Batches & FEFO Tracking"
      subtitle="Track batches, manufacturing & expiry dates, and shelf rack locations"
      icon="time-outline"
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

