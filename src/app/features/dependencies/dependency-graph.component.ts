import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { DependencyService } from '../../core/services/dependency.service';

interface D3Node {
  id: number;
  name: string;
  criticality: string;
  techStack: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link {
  source: number | D3Node;
  target: number | D3Node;
  type: string;
  criticality: number;
}

@Component({
  selector: 'app-dependency-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dependency-graph.component.html',
  styleUrls: ['./dependency-graph.component.scss']
})
export class DependencyGraphComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  
  loading = signal<boolean>(true);
  error = signal<string>('');
  showLegend = signal<boolean>(true);
  showStats = signal<boolean>(true);
  zoomLevel = signal<number>(100);
  selectedNode = signal<D3Node | null>(null);
  hoveredNode = signal<D3Node | null>(null);
  
  // Statistics
  totalModules = signal<number>(0);
  totalConnections = signal<number>(0);
  criticalModules = signal<number>(0);
  
  private svg: any;
  private simulation: any;
  private g: any;
  private zoom: any;
  private width = 1400;
  private height = 750;
  private nodeRadius = 35; // Increased from 20

  constructor(private dependencyService: DependencyService) {}

  ngOnInit(): void {
    this.loadDependencyGraph();
  }

  loadDependencyGraph(): void {
    this.dependencyService.getDependencyGraph().subscribe({
      next: (graph) => {
        this.totalModules.set(graph.nodes.length);
        this.totalConnections.set(graph.links.length);
        this.criticalModules.set(graph.nodes.filter((n: any) => n.criticality === 'CRITICAL').length);
        
        setTimeout(() => this.createDependencyGraph(graph), 100);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load dependency graph. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private createDependencyGraph(data: any): void {
    // Clear previous SVG
    d3.select(this.graphContainer.nativeElement).selectAll('svg').remove();

    // Create SVG
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'graph-svg');

    // Add defs for gradients and filters
    const defs = this.svg.append('defs');

    // Add drop shadow filter
    defs.append('filter')
      .attr('id', 'drop-shadow')
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', 3);

    // Add zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.zoomLevel.set(Math.round(event.transform.k * 100));
      });

    this.svg.call(this.zoom);

    // Group for transformations
    this.g = this.svg.append('g');

    // Create force simulation with better physics
    this.simulation = d3.forceSimulation(data.nodes as D3Node[])
      .force('link', d3.forceLink(data.links as D3Link[])
        .id((d: any) => d.id)
        .distance((d: any) => {
          // Longer distance for critical nodes
          return d.source.criticality === 'CRITICAL' ? 200 : 150;
        })
        .strength(0.4))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide().radius(() => this.nodeRadius + 10))
      .alpha(1)
      .alphaDecay(0.025)
      .velocityDecay(0.3);

    // Draw links first (so they appear behind nodes)
    const link = this.g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d: any) => this.getLinkColor(d.criticality))
      .attr('stroke-width', (d: any) => this.getLinkWidth(d.criticality))
      .attr('opacity', 0.7)
      .attr('stroke-linecap', 'round');

    // Add link labels (dependency type)
    const linkLabels = this.g.append('g')
      .selectAll('text')
      .data(data.links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('font-size', 12)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('background', 'white')
      .attr('dy', -5)
      .text((d: any) => d.type);

    // Draw nodes with improved sizing and styling
    const node = this.g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', this.nodeRadius)
      .attr('fill', (d: any) => this.getNodeColor(d.criticality))
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .attr('filter', 'url(#drop-shadow)')
      .style('cursor', 'pointer')
      .call(this.drag(this.simulation))
      .on('click', (event: any, d: any) => {
        event.stopPropagation();
        this.selectedNode.set(d);
      })
      .on('mouseover', (event: any, d: any) => {
        this.onNodeHover(d, data.nodes);
        this.hoveredNode.set(d);
      })
      .on('mouseout', () => {
        this.onNodeHoverOut(node);
        this.hoveredNode.set(null);
      });

    // Add tooltips for nodes
    node.append('title')
      .text((d: any) => {
        return `${d.name}\nCriticality: ${d.criticality}\nTech: ${d.techStack}`;
      });

    // Add labels with better text handling
    // Add labels - Simple version without wrapping
const labels = this.g.append('g')
  .selectAll('text')
  .data(data.nodes)
  .enter()
  .append('text')
  .attr('class', 'node-label')
  .attr('text-anchor', 'middle')
  .attr('dy', '.35em')
  .attr('font-size', 13)
  .attr('font-weight', 700)
  .attr('fill', '#fff')
  .attr('pointer-events', 'none')
  .attr('paint-order', 'stroke')
  .attr('stroke', '#333')
  .attr('stroke-width', 3)
  .text((d: any) => {
    // Simple truncation
    if (d.name.length <= 10) {
      return d.name;
    }
    return d.name.substring(0, 9) + '…';
  });


    // Update on each tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d: any) => {
          d.x = Math.max(this.nodeRadius + 5, Math.min(this.width - this.nodeRadius - 5, d.x));
          return d.x;
        })
        .attr('cy', (d: any) => {
          d.y = Math.max(this.nodeRadius + 5, Math.min(this.height - this.nodeRadius - 5, d.y));
          return d.y;
        });

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  }


  private getNodeColor(criticality: string): string {
    switch (criticality) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  private getLinkColor(criticality: number): string {
    if (criticality >= 80) return '#dc3545';
    if (criticality >= 60) return '#fd7e14';
    if (criticality >= 40) return '#ffc107';
    return '#28a745';
  }

  private getLinkWidth(criticality: number): number {
    if (criticality >= 80) return 4;
    if (criticality >= 60) return 3;
    if (criticality >= 40) return 2.5;
    return 2;
  }

  private drag(simulation: any) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  private onNodeHover(hoveredNode: D3Node, allNodes: D3Node[]): void {
    // Highlight connected nodes
    d3.selectAll('.node')
      .style('opacity', (d: any) => {
        return d.id === hoveredNode.id ? 1 : 0.4;
      });

    d3.selectAll('.node-label')
      .style('opacity', (d: any) => {
        return d.id === hoveredNode.id ? 1 : 0.4;
      });

    d3.selectAll('.link')
      .style('opacity', (d: any) => {
        return (d.source.id === hoveredNode.id || d.target.id === hoveredNode.id) ? 0.9 : 0.2;
      });
  }

  private onNodeHoverOut(node: any): void {
    d3.selectAll('.node').style('opacity', 1);
    d3.selectAll('.node-label').style('opacity', 1);
    d3.selectAll('.link').style('opacity', 0.7);
  }

  resetZoom(): void {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity
        .translate(0, 0)
        .scale(1));
  }

  toggleLegend(): void {
    this.showLegend.set(!this.showLegend());
  }

  toggleStats(): void {
    this.showStats.set(!this.showStats());
  }

  deselectNode(): void {
    this.selectedNode.set(null);
  }
}
