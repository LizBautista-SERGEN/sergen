
interface LoadingStateProps {
  loading: boolean;
  isEmpty: boolean;
}

export const TableStateDisplay = ({ loading, isEmpty }: LoadingStateProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay usuarios registrados en el sistema</p>
      </div>
    );
  }

  return null;
};
