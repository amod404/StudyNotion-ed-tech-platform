exports.initialImage = (firstName, lastName) => {
  let letters = '0123456789ABCD';
  let color = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=#`;
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 14)];
  }
  return color;
}
