import { UserHasAccess, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRIVILEGE_RECEPTION_METRIC, PRIVILIGE_TRIAGE_METRIC } from '../constants';
import {
  useSelectedQueueLocationUuid,
  useSelectedQueueRoomLocationName,
  useSelectedQueueRoomLocationUuid,
} from '../helpers/helpers';
import { useQueueRoomLocations } from '../patient-search/hooks/useQueueRooms';
import {
  useActiveVisits,
  usePatientsBeingServed,
  usePatientsServed,
  useQueuePatients,
} from './clinic-metrics.resource';
import styles from './clinic-metrics.scss';
import MetricsCard from './metrics-card.component';
import { useParentLocation } from '../active-visits/patient-queues.resource';

function ClinicMetrics() {
  const { t } = useTranslation();

  const session = useSession();

  const { location: locations, isLoading: loading } = useParentLocation(session?.sessionLocation?.uuid);

  const { patientQueueCount, isLoading } = usePatientsBeingServed(session?.sessionLocation?.uuid, 'pending');

  const { servedCount } = usePatientsServed(session?.sessionLocation?.uuid, 'picked');

  const { count } = useQueuePatients('picked');

  const { count: pendingCount } = useQueuePatients('pending');

  const { location: childLocations, isLoading: loadingChildLocations } = useParentLocation(
    locations?.parentLocation?.uuid,
  );

  let rooms = [];
  childLocations?.childLocations.map((location) => {
    return rooms.push({
      label: location?.display,
      value: 0,
    });
  });

  console.info(JSON.stringify(childLocations, null, 2));

  // receptionist ui
  return (
    <>
      <div className={styles.cardContainer}>
        <UserHasAccess privilege={PRIVILEGE_RECEPTION_METRIC}>
          <MetricsCard
            values={[{ label: 'Patients', value: pendingCount }]}
            headerLabel={t('checkedInPatients', 'Checked in patients')}
          />
          <MetricsCard
            values={[{ label: 'Expected Appointments', value: 0 }]}
            headerLabel={t('noOfExpectedAppointments', 'No. Of Expected Appointments')}
          />
          <MetricsCard
            values={[
              { label: 'Triage', value: 0 },
              { label: 'Clinical Room', value: 0 },
              { label: 'Laboratory', value: 0 },
              { label: 'Radiology', value: 0 },
              { label: 'Pharmacy', value: 0 },
            ]}
            headerLabel={t('currentlyServing', 'No. of Currently being Served')}
          />
        </UserHasAccess>

        <UserHasAccess privilege={PRIVILIGE_TRIAGE_METRIC}>
          <MetricsCard
            values={[{ label: 'Patients waiting to be Served', value: patientQueueCount }]}
            headerLabel={t('pendingTriageServing', 'Patients waiting to be Served')}
          />
          <MetricsCard
            values={[{ label: 'Patients Served', value: servedCount }]}
            headerLabel={t('noOfPatientsServed', 'No. Of Patients Served')}
          />
        </UserHasAccess>
      </div>
    </>
  );
}

export default ClinicMetrics;
