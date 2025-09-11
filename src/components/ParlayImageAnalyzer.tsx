import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image as ImageIcon, Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface BetAnalysis {
  description: string;
  probability: number;
  recommendation: 'keep' | 'remove' | 'modify';
  reasoning: string;
}

interface ParlayAnalysis {
  bets?: BetAnalysis[];
  overall_probability?: number;
  risk_level?: 'low' | 'medium' | 'high';
  total_stake?: string;
  potential_payout?: string;
  recommendations?: string[];
  key_factors?: string[];
  text_analysis?: string;
}

export const ParlayImageAnalyzer = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ParlayAnalysis | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setAnalysis(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG or PNG image",
          variant: "destructive",
        });
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Converting image to base64...');
      const base64Image = await convertToBase64(selectedFile);
      
      console.log('Sending image for analysis...');
      const { data, error } = await supabase.functions.invoke('analyze-parlay-image', {
        body: {
          image: base64Image,
          imageType: selectedFile.type
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('Analysis completed:', data);
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Your parlay has been analyzed successfully",
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to analyze image',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'remove': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'modify': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return 'bg-green-50 text-green-700 border-green-200';
      case 'remove': return 'bg-red-50 text-red-700 border-red-200';
      case 'modify': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          AI Parlay Image Analyzer
        </h2>
        <p className="text-muted-foreground mb-6">
          Upload a screenshot of your parlay betting slip and get AI-powered analysis with probability assessments and recommendations.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">JPG or PNG (MAX. 10MB)</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Parlay preview"
                className="w-full max-w-md mx-auto rounded-lg border"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Parlay'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {analysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          
          {analysis.text_analysis ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="whitespace-pre-wrap text-sm">
                  {analysis.text_analysis}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.overall_probability && (
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {analysis.overall_probability.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Probability</div>
                  </div>
                )}
                
                {analysis.risk_level && (
                  <div className="text-center">
                    <Badge className={`${getRiskColor(analysis.risk_level)} mb-2`}>
                      {analysis.risk_level.toUpperCase()} RISK
                    </Badge>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                )}
                
                {analysis.potential_payout && (
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.potential_payout}
                    </div>
                    <div className="text-sm text-muted-foreground">Potential Payout</div>
                  </div>
                )}
              </div>

              {/* Individual Bets */}
              {analysis.bets && analysis.bets.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Individual Bet Analysis</h4>
                  {analysis.bets.map((bet, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{bet.description}</h5>
                        <div className="flex items-center gap-2">
                          <Badge className={getRecommendationColor(bet.recommendation)}>
                            {getRecommendationIcon(bet.recommendation)}
                            {bet.recommendation.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {bet.probability}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{bet.reasoning}</p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Factors */}
              {analysis.key_factors && analysis.key_factors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Factors to Consider</h4>
                  <ul className="space-y-1">
                    {analysis.key_factors.map((factor, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};