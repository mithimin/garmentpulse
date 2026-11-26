// apps/mobile/src/components/ExpensesCard.tsx
//
// The "Costs for this job" card on the technician's job page. The technician can
// send a cost with an invoice photo and a receipt photo (no receipt, no expense),
// and see the costs already sent for this job with their status word.
// It uses FAKE data for now (see data/fakeExpenses.ts). The photo buttons only mark
// a photo as added; no real photo is uploaded yet.
// Owned by Rubaiya.

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { localizeDigits } from '../language/format';
import { useLanguage } from '../language/LanguageContext';
import { EXPENSE_TEXT } from '../language/expenseText';
import {
  MAX_REASON_LENGTH,
  parseExpenseAmount,
  sendFakeExpense,
  useFakeExpenses,
} from '../data/fakeExpenses';
import type { FakeExpense, FakeExpenseStatus } from '../data/fakeExpenses';
import { STATUS_COLORS, COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';
import { Button } from './Button';
import { Card } from './Card';

type Props = {
  reportId: string;
  /** False until the job is accepted and work has started (api-contract 4.8). */
  canAdd: boolean;
};

type Problem = 'amount' | 'reason' | 'photos';

export function ExpensesCard({ reportId, canAdd }: Props) {
  const { language } = useLanguage();
  const expenses = useFakeExpenses(reportId);
  const [formOpen, setFormOpen] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const [invoiceAdded, setInvoiceAdded] = useState(false);
  const [receiptAdded, setReceiptAdded] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  function resetForm() {
    setAmountText('');
    setReason('');
    setInvoiceAdded(false);
    setReceiptAdded(false);
    setProblem(null);
    setFormOpen(false);
  }

  function send() {
    const amount = parseExpenseAmount(amountText);
    if (amount === null) return setProblem('amount');
    const text = reason.trim();
    if (text.length === 0 || text.length > MAX_REASON_LENGTH) return setProblem('reason');
    if (!invoiceAdded || !receiptAdded) return setProblem('photos');
    sendFakeExpense(reportId, amount, text);
    resetForm();
  }

  const problemText = problem
    ? EXPENSE_TEXT[
        problem === 'amount'
          ? 'amountInvalid'
          : problem === 'reason'
            ? 'reasonMissing'
            : 'photosMissing'
      ][language]
    : null;

  return (
    <Card>
      <Text style={styles.title}>{EXPENSE_TEXT.sectionTitle[language]}</Text>

      {expenses.length === 0 ? (
        <Text style={styles.muted}>{EXPENSE_TEXT.noCostsYet[language]}</Text>
      ) : (
        expenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
      )}

      {!canAdd ? (
        <Text style={styles.muted}>{EXPENSE_TEXT.notStartedNote[language]}</Text>
      ) : formOpen ? (
        <View style={styles.form}>
          <Text style={styles.label}>{EXPENSE_TEXT.amountLabel[language]}</Text>
          <TextInput
            style={styles.input}
            value={amountText}
            onChangeText={(text) => {
              setAmountText(text);
              setProblem(null);
            }}
            placeholder={EXPENSE_TEXT.amountHint[language]}
            placeholderTextColor={S.inputHint}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>{EXPENSE_TEXT.reasonLabel[language]}</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              setProblem(null);
            }}
            placeholder={EXPENSE_TEXT.reasonHint[language]}
            placeholderTextColor={S.inputHint}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>{EXPENSE_TEXT.invoiceLabel[language]}</Text>
          <Button
            kind="second"
            label={
              invoiceAdded ? EXPENSE_TEXT.photoAdded[language] : EXPENSE_TEXT.addPhoto[language]
            }
            onPress={() => {
              setInvoiceAdded(true);
              setProblem(null);
            }}
          />

          <Text style={styles.label}>{EXPENSE_TEXT.receiptLabel[language]}</Text>
          <Button
            kind="second"
            label={
              receiptAdded ? EXPENSE_TEXT.photoAdded[language] : EXPENSE_TEXT.addPhoto[language]
            }
            onPress={() => {
              setReceiptAdded(true);
              setProblem(null);
            }}
          />
          <Text style={styles.demo}>{EXPENSE_TEXT.demoPhotoNote[language]}</Text>

          {problemText && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{problemText}</Text>
            </View>
          )}

          <Button label={EXPENSE_TEXT.sendButton[language]} onPress={send} />
          <Button kind="second" label={EXPENSE_TEXT.cancelButton[language]} onPress={resetForm} />
        </View>
      ) : (
        <Button label={EXPENSE_TEXT.addButton[language]} onPress={() => setFormOpen(true)} />
      )}
    </Card>
  );
}

/** One cost in the list: amount, status word and the reason. */
function ExpenseRow({ expense }: { expense: FakeExpense }) {
  const { language } = useLanguage();
  const colors = expenseStatusColors(expense.status);
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.amount}>৳ {localizeDigits(String(expense.amount), language)}</Text>
        <View style={[styles.badge, { backgroundColor: colors.background }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {EXPENSE_TEXT[`status${cap(expense.status)}`][language]}
          </Text>
        </View>
      </View>
      <Text style={styles.reason}>{expense.reason}</Text>
    </View>
  );
}

function expenseStatusColors(status: FakeExpenseStatus): { background: string; text: string } {
  if (status === 'approved') return STATUS_COLORS.resolved;
  if (status === 'waiting') return STATUS_COLORS.waiting;
  return { background: S.errorBackground, text: S.errorText };
}

function cap(status: FakeExpenseStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const styles = StyleSheet.create({
  title: { color: C.text, fontSize: 18, fontWeight: '600' },
  muted: { color: C.softText, fontSize: 15, lineHeight: 22, marginTop: 10 },
  row: {
    borderTopWidth: 1,
    borderTopColor: S.inputBorder,
    paddingVertical: 10,
    marginTop: 10,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { color: C.text, fontSize: 18, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  reason: { color: C.text, fontSize: 15, lineHeight: 22, marginTop: 4 },
  form: { marginTop: 12, gap: 6 },
  label: { color: C.softText, fontSize: 13, fontWeight: '600', marginTop: 8 },
  input: {
    backgroundColor: S.inputBackground,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.text,
  },
  multiline: { minHeight: 80 },
  demo: { color: C.softText, fontSize: 13, marginTop: 2 },
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
    marginTop: 8,
  },
  errorText: { color: S.errorText, fontSize: 15, lineHeight: 22 },
});
