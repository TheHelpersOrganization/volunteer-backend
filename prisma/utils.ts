import { faker as fakerVi } from '@faker-js/faker/locale/vi';

export const randomDate = () => {
  return fakerVi.date.between('2018-01-01', new Date());
};

export const generateViName = (
  genderName: 'male' | 'female',
): { firstName: string; lastName: string } => {
  let firstName = fakerVi.name.lastName(genderName);
  let lastName = fakerVi.name.firstName(genderName);

  const parts = lastName.split(' ');
  if (parts.length > 1) {
    firstName += ' ' + parts[0];
  }
  lastName = parts[parts.length - 1];

  return {
    firstName,
    lastName,
  };
};
