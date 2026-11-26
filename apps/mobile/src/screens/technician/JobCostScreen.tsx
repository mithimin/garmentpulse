// apps/mobile/src/screens/technician/JobCostScreen.tsx
//
// The cost screen for ONE finished job. It opens right after the technician taps
// "Mark as fixed", and it can also be opened later from the job page. The
// technician types how much the job cost (taka) and what it was for. No photos.
// It uses FAKE data for now (data/fakeExpenses.ts), so nothing goes to the backend yet.
// Owned by Rubaiya.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  MAX_REASON_LENGTH,
  parseExpenseAmount,
  sendFakeExpense,
  useFakeExpenses,
} from '../../data/fakeExpenses';
import type { FakeExpense, FakeExpenseStatus } from '../../data/fakeExpenses';
import { EXPENSE_TEXT } from '../../language/expenseText';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { machineName } from '../../language/localNames';
import { STATUS_COLORS, COLORS as C, SHARED_COLORS as S, SIZES } from '../../theme';

type Props = {
  job: Report;
};

type Problem = 'amount' | 'reason';

export function JobCostScreen({ job }: Props) {
  const { language } = useLanguage();
  const expenses = useFakeExpenses(job.id);
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [sent, setSent] = useState(false);

  function send() {
    const amount = parseExpenseAmount(amountText);
    if (amount === null) return setProblem('amount');
    const text = reason.trim();
    if (text.length === 0 || text.length > MAX_REASON_LENGTH) return setProblem('reason');
    sendFakeExpense(job.id, amount, text);
    setAmountText('');
    setReason('');
    setProblem(null);
    setSent(true);
  }

  const problemText = problem
    ? EXPENSE_TEXT[problem === 'amount' ? 'amountInvalid' : 'reasonMissing'][language]
    : null;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.machine}>{machineName(job.machine, language)}</Text>
        <Text style={styles.intro}>{EXPENSE_TEXT.costIntro[language]}</Text>

        <Text style={styles.label}>{EXPENSE_TEXT.amountLabel[language]}</Text>
        <TextInput
          style={styles.input}
          value={amountText}
          onChangeText={(text) => {
            setAmountText(text);
            setProblem(null);
            setSent(false);
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
            setSent(false);
          }}
          placeholder={EXPENSE_TEXT.reasonHint[language]}
          placeholderTextColor={S.inputHint}
          multiline
          textAlignVertical="top"
        />

        {problemText && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{problemText}</Text>
          </View>
        )}

        {sent && <Text style={styles.sentText}>{EXPENSE_TEXT.sentTitle[language]}</Text>}

        <View style={styles.buttonGap}>
          <Button label={EXPENSE_TEXT.sendButton[language]} onPress={send} />
        </View>
        <Text style={styles.demo}>{EXPENSE_TEXT.demoNote[language]}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>{EXPENSE_TEXT.sectionTitle[language]}</Text>
        {expenses.length === 0 ? (
          <Text style={styles.muted}>{EXPENSE_TEXT.noCostsYet[language]}</Text>
        ) : (
          expenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
        )}
      </Card>
    </ScrollView>
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
  content: { padding: SIZES.screenPadding, gap: 18 },
  machine: { color: C.text, fontSize: 20, fontWeight: '600' },
  intro: { color: C.softText, fontSize: 15, lineHeight: 22, marginTop: 6 },
  title: { color: C.text, fontSize: 18, fontWeight: '600' },
  muted: { color: C.softText, fontSize: 15, lineHeight: 22, marginTop: 10 },
  label: { color: C.softText, fontSize: 13, fontWeight: '600', marginTop: 14 },
  input: {
    backgroundColor: S.inputBackground,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.text,
    marginTop: 6,
  },
  multiline: { minHeight: 90 },
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
    marginTop: 12,
  },
  errorText: { color: S.errorText, fontSize: 15, lineHeight: 22 },
  sentText: { color: C.text, fontSize: 15, fontWeight: '600', marginTop: 12 },
  buttonGap: { marginTop: 14 },
  demo: { color: C.softText, fontSize: 13, marginTop: 10 },
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
});
