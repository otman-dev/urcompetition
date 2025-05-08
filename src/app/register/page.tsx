import { connectToDatabase } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  await connectToDatabase();
  const teams = await Team.find().sort({ teamName: 1 });

  return <RegisterForm initialTeams={JSON.parse(JSON.stringify(teams))} />;
}