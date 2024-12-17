import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SelectedSeat {
  type: 'seat' | 'table';
  row?: number;
  seat?: number;
  table?: number;
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
    setSelectedSeat({ type: 'seat', row, seat });
    const key = `seat-${row}-${seat}`;
    setName(seats[key] || '');
    setShowDialog(true);
  };

  const handleTableClick = (table: number) => {
    setSelectedSeat({ type: 'table', table });
    const key = `table-${table}`;
    setName(seats[key] || '');
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!selectedSeat) return;
    
    const key = selectedSeat.type === 'seat' 
      ? `seat-${selectedSeat.row}-${selectedSeat.seat}`
      : `table-${selectedSeat.table}`;

    if (name.trim()) {
      setSeats(prev => ({
        ...prev,
        [key]: name.trim()
      }));
    } else {
      setSeats(prev => {
        const newSeats = { ...prev };
        delete newSeats[key];
        return newSeats;
      });
    }

    setShowDialog(false);
    setName('');
  };

  const copySeatingPlan = () => {
    let plan = 'План рассадки:\n\n';
    
    // Сначала столы
    const tableEntries = Object.entries(seats)
      .filter(([key]) => key.startsWith('table-'))
      .map(([key, name]) => {
        const [_, table] = key.split('-');
        return {
          type: 'table',
          table: parseInt(table),
          name
        };
      })
      .sort((a, b) => a.table - b.table);

    if (tableEntries.length > 0) {
      plan += 'За столами:\n';
      tableEntries.forEach(({table, name}) => {
        plan += `Стол ${table}: ${name}\n`;
      });
      plan += '\n';
    }

    // Затем места в зале
    const seatEntries = Object.entries(seats)
      .filter(([key]) => key.startsWith('seat-'))
      .map(([key, name]) => {
        const [_, row, seat] = key.split('-');
        return {
          type: 'seat',
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
    
    if (seatEntries.length > 0) {
      plan += 'Места в зале:\n';
      seatEntries.forEach(({row, seat, name}) => {
        plan += `Ряд ${row}, Место ${seat}: ${name}\n`;
      });
    }
    
    navigator.clipboard.writeText(plan);
  };

  const renderSeat = (row: number, seat: number) => {
    const key = `seat-${row}-${seat}`;
    const occupantName = seats[key];
    const isOccupied = !!occupantName;
    
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
          <div className="text-xs mt-1 font-medium text-center w-full" style={{ lineHeight: '1.1' }}>
            {occupantName}
          </div>
        )}
      </div>
    );
  };

  const renderTables = () => (
    <div className="flex justify-center mb-8 space-x-4">
      {[1, 2, 3].map(table => {
        const key = `table-${table}`;
        const occupantName = seats[key];
        const isOccupied = !!occupantName;

        return (
          <div
            key={`table-${table}`}
            onClick={() => handleTableClick(table)}
            className={`w-32 p-2 ${isOccupied ? 'bg-blue-500 text-white' : 'bg-gray-300'} 
              rounded-lg flex flex-col items-center cursor-pointer hover:opacity-80`}
            style={{ minHeight: occupantName ? 'auto' : '4rem' }}
          >
            <div>Стол {table}</div>
            {occupantName && (
              <div className="text-xs mt-1 font-medium text-center w-full break-words">
                {occupantName}
              </div>
            )}
          </div>
        );
      })}
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
              {selectedSeat?.type === 'seat' 
                ? `${seats[`seat-${selectedSeat.row}-${selectedSeat.seat}`] ? 'Изменить' : 'Добавить'} человека (Ряд ${selectedSeat.row}, Место ${selectedSeat.seat})`
                : `${seats[`table-${selectedSeat?.table}`] ? 'Изменить' : 'Добавить'} человека за столом ${selectedSeat?.table}`}
            </DialogTitle>
          </DialogHeader>
          <div className="my-4">
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
              {name.trim() ? 'Сохранить' : 'Очистить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatingChart;