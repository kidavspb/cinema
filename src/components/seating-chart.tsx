import { useState, useRef } from 'react';
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
  const chartRef = useRef<HTMLDivElement>(null);

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
    
    const sortedSeats = Object.entries(seats)
      .map(([key, name]) => {
        const [row, seat] = key.split('-');
        return {
          row: parseInt(row),
          seat: parseInt(seat),
          name
        };
      })
      .sort((a, b) => {
        if (a.row !== b.row) {
          return a.row - b.row;
        }
        return a.seat - b.seat;
      });
    
    sortedSeats.forEach(({row, seat, name}) => {
      plan += `Ряд ${row}, Место ${seat}: ${name}\n`;
    });
    
    navigator.clipboard.writeText(plan);
  };

  const renderSeat = (row: number, seat: number) => {
    const isOccupied = seats[`${row}-${seat}`];
    const occupantName = seats[`${row}-${seat}`] || '';
    
    const seatStyle = `w-20 h-16 m-1 rounded-lg flex flex-col items-center justify-center p-1
      ${isOccupied ? 'bg-blue-500 text-white' : 'bg-gray-200'} 
      hover:opacity-80 cursor-pointer`;

    return (
      <div
        key={`${row}-${seat}`}
        className={seatStyle}
        onClick={() => handleSeatClick(row, seat)}
      >
        <div className="text-xs">{seat}</div>
        {occupantName && (
          <div className="text-xs mt-1 font-medium overflow-hidden text-center w-full">
            {occupantName}
          </div>
        )}
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">План рассадки</h1>
      
      <div ref={chartRef} className="bg-white p-8 rounded-lg shadow-sm" style={{ minWidth: '800px' }}>
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
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={copySeatingPlan}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Скопировать список
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
              onKeyPress={handleKeyPress}
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