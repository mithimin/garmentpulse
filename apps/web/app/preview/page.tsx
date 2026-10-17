'use client';

// apps/web/app/preview/page.tsx
//
// TEMPORARY page for Mithi only. It shows every building block in one place
// (top bar, cards, buttons, labels, inputs, count boxes, table, messages) so we
// can check the look in both languages. Delete this page before the final pull
// request. Owned by Mithi.

import { FAKE_REPORTS, FAKE_TECHNICIANS } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { DataTable } from '../../components/DataTable';
import { Field, SelectInput, TextInput } from '../../components/Field';
import { AvailabilityLabel, StatusLabel } from '../../components/StatusLabel';
import { EmptyMessage, ErrorMessage, LoadingMessage } from '../../components/StateMessage';
import { TopBar } from '../../components/TopBar';
import { useLanguage } from '../../language/LanguageContext';
import { formatDateTime } from '../../language/format';

export default function PreviewPage() {
  const { language } = useLanguage();
  return (
    <>
      <TopBar role="manager" onLogOut={() => undefined} />
      <main className="page">
        <div className="page-header">
          <h1>Building blocks</h1>
          <Button kind="main">Main button</Button>
        </div>

        <div className="grid-cards">
          <CountBox label="Waiting" count={3} />
          <CountBox label="In progress" count={2} />
          <CountBox label="Resolved" count={14} />
        </div>

        <Card>
          <h2>Reports</h2>
          <DataTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>Machine</th>
                <th>Status</th>
                <th>Reported</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {FAKE_REPORTS.slice(0, 4).map((report) => (
                <tr key={report.id}>
                  <td className="code">{report.machine.name}</td>
                  <td>{report.description}</td>
                  <td>
                    <StatusLabel status={report.status} />
                  </td>
                  <td>{formatDateTime(report.created_at, language)}</td>
                  <td className="actions">
                    <Button small>Open</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Card>

        <div className="grid-cards">
          <Card>
            <h3>Technicians</h3>
            {FAKE_TECHNICIANS.map((tech) => (
              <p key={tech.id}>
                {tech.display_name} <AvailabilityLabel availability={tech.availability} />
              </p>
            ))}
          </Card>
          <Card>
            <h3>Inputs</h3>
            <Field label="Email">
              {(id) => <TextInput id={id} placeholder="you@factory.com" />}
            </Field>
            <Field label="Machine" error="Choose a machine first">
              {(id) => (
                <SelectInput id={id}>
                  <option>Pick one</option>
                </SelectInput>
              )}
            </Field>
            <Button kind="danger">Danger</Button> <Button disabled>Disabled</Button>
          </Card>
        </div>

        <Card>
          <LoadingMessage />
          <EmptyMessage />
          <ErrorMessage onRetry={() => undefined} />
        </Card>
      </main>
    </>
  );
}
