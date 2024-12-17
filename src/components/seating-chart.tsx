import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SelectedSeat {
  row: number;
  seat: number;
}

interface SeatsData {
  [key: string]: string;
}

const SeatingChart = () => {
  const [seats, setSeats] = useState<SeatsData>({});
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [name, setName] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleSeatClick = (row: number, seat: number) => {
    setSelectedSeat({ row, seat });
    setName(seats[`${row}-${seat}`] || '');
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!selectedSeat) return;
    
    if (name.trim()) {
      setSeats(prev => ({
        ...prev,
        [`${selectedSeat.row}-${selectedSeat.seat}`]: name.trim()
      }));
    } else {
      const newSeats = { ...seats };
      delete newSeats[`${selectedSeat.row}-${selectedSeat.seat}`];
      setSeats(newSeats);
    }
    setShowDialog(false);
    setName('');
  };

  const copySeatingPlan = () => {
    let plan = 'План рассадки:\n\n';
    Object.entries(seats).forEach(([key, name]) => {
      const [row, seat] = key.split('-');
      plan += `Ряд ${row}, Место ${seat}: ${name}\n`;
    });
    navigator.clipboard.writeText(plan);
  };

  const renderSeat = (row: number, seat: number) => {
    const isOccupied = seats[`${row}-${seat}`];
    const seatStyle = `w-12 h-12 m-1 rounded-lg flex items-center justify-center text-sm 
      ${isOccupied ? 'bg-blue-500 text-white' : 'bg-gray-200'} 
      hover:opacity-80 cursor-pointer`;

    return (
      <div
        key={`${row}-${seat}`}
        className={seatStyle}
        onClick={() => handleSeatClick(row, seat)}
        title={isOccupied ? seats[`${row}-${seat}`] : 'Свободно'}
      >
        {seat}
      </div>
    );
  };

  const renderTables = () => (
    <div className="flex justify-center mb-8 space-x-4">
      {[1, 2, 3].map(table => (
        <div
          key={`table-${table}`}
          className="w-24 h-16 bg-gray-300 rounded-lg flex items-center justify-center"
        >
          Стол {table}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">План рассадки</h1>
      
      {renderTables()}

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(row => (
          <div key={row} className="flex justify-center items-center">
            <span className="w-8 text-right mr-4">Ряд {row}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(seat => renderSeat(row, seat))}
              <div className="w-8" /> {/* Проход */}
              {[6, 7, 8, 9, 10].map(seat => renderSeat(row, seat))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={copySeatingPlan}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Скопировать план рассадки
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {seats[`${selectedSeat?.row}-${selectedSeat?.seat}`] 
                ? 'Изменить данные места' 
                : 'Занять место'}
            </DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="mb-2">
              Ряд {selectedSeat?.row}, Место {selectedSeat?.seat}
            </p>
            <Input
              type="text"
              placeholder="Введите фамилию"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} variant="outline">
              Отмена
            </Button>
            <Button onClick={handleSave} className="bg-blue-500 text-white">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatingChart;