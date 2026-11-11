import React from 'react';
import { ProductBatchItem } from '../../common/types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonBatchTable } from '../../common/components/CommonBatchTable';

interface AgroBatchSectionProps {
  batches: ProductBatchItem[];
  onChangeBatches: (batches: ProductBatchItem[]) => void;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
}

export const AgroBatchSection: React.FC<AgroBatchSectionProps> = ({
  batches,
  onChangeBatches,
  basePurchasePrice,
  baseSellingPrice,
  baseMrp,
}) => {
  return (
    <CommonFormCard
      title="Agro Batch, Lot & Expiry Tracking"
      subtitle="Track production lots, manufacturing dates, and shelf-life expiration"
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

