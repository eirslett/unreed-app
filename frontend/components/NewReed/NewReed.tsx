import { useId, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Field, SelectField, TextField } from '../Form/Form';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Textarea } from '../Textarea/Textarea';
import { Button, Buttons } from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import { ReedData, ReedType } from '../../types';
import { useData } from '../Data/Data';

export function NewReedRoute() {
  const data = useData();
  const navigate = useNavigate();

  function createReed(reed: ReedData) {
    const entry_id = uuid();
    const reed_id = uuid();
    const entry_timestamp = new Date().toISOString();
    data.write({ entry_type: 'create', entry_id, reed_id, entry_timestamp, data: reed });

    navigate('/reed/' + reed_id);
  }
  return <NewReedPage createReed={createReed} />;
}

export function NewReedPage({ createReed }: { createReed(reed: ReedData): void }) {
  const [color, setColor] = useState<string | undefined>(undefined);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const reedData: ReedData = {
      reedType: data.get('reedType') as ReedType,
      reedIdentification: data.get('reedIdentification') as string,
      threadColor: color ?? '',
      caneProducer: data.get('caneProducer') as string,
      caneDiameter: data.get('caneDiameter') as string,
      caneHardness: data.get('caneHardness') as string,
      caneDensity: data.get('caneDensity') as string,
      gougeThickness: data.get('gougeThickness') as string,
      shaperForm: data.get('shaperForm') as string,
      stapleModel: data.get('stapleModel') as string,
      stapleLength: data.get('stapleLength') as string,
      tiedReedLength: data.get('tiedReedLength') as string,
      currentLength: data.get('tiedReedLength') as string,
      comments: '', // data.get('comments') as string,
    };
    createReed(reedData);
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>New Reed</h1>
      <h2>Recognizing the reed</h2>
      <SelectField name="reedType" label="Reed type">
        <option value="oboe">Oboe</option>
        <option value="english-horn">English horn</option>
      </SelectField>
      <TextField
        name="reedIdentification"
        label="Identification"
        placeholder="Reed ID/number/code/name"
        required
      />
      <Field>
        <label>Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </Field>

      <h2>Which cane is used?</h2>
      <TextField
        name="caneProducer"
        label="Cane Producer"
        placeholder="Glotin, Alliaud, Rigotti..."
      />
      <TextField name="caneDiameter" label="Cane Diameter" placeholder="10, 10.0-10.5, 11..." />
      <TextField
        name="caneHardness"
        label="Cane Hardness"
        placeholder="soft/medium/hard, 9, 10, 11..."
      />
      <TextField name="caneDensity" label="Cane Density" placeholder="-50, -60..." />
      <TextField
        name="gougeThickness"
        label="Gouge Thickness"
        placeholder="56, 58-60, maybe thin sides..."
      />
      <TextField
        name="shaperForm"
        label="Shaper Form"
        placeholder="Klopfer 722, RC12, Rigoutat -2..."
      />

      <h2>Which staple is used?</h2>
      <TextField
        name="stapleModel"
        label="Staple Model"
        placeholder="Loree, RC2, Chiarugi 2, Marigaux 1 SL, Klopfer D11..."
      />
      <TextField name="stapleLength" label="Staple Length" placeholder="46 mm, 47 mm..." />

      <h2>Other information</h2>
      <TextField
        name="tiedReedLength"
        label="Initial Tied Reed Length (before clipping)"
        placeholder="73 mm, 75 mm..."
      />

      <Field>
        <label>Comments</label>
        <Textarea name="comments" placeholder="General comments about the reed blank" />
      </Field>

      <Buttons>
        <Button type="submit" variant="primary">
          Register this reed
        </Button>
        <Button variant="warning">Cancel</Button>
      </Buttons>
    </form>
  );
}
