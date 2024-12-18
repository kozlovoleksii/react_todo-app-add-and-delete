export function sendErrorMessage(
  errorText: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
) {
  setErrorMessage(errorText);
  setTimeout(() => {
    setErrorMessage('');
  }, 3000);
}
